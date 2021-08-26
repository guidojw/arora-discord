import '../extensions' // Extend Discord.js structures before the client collections get instantiated.
import type {
  APIMessage,
  GuildMember,
  Message,
  MessageOptions,
  PartialGuildMember,
  Presence,
  User
} from 'discord.js'
import type {
  // Commando doesn't export these. PR a fix and uncomment this + fix
  // Client.bindEvent when merged.
  // CommandoClientEvents,
  CommandoClientOptions,
  CommandoMessage,
  Inhibition
} from 'discord.js-commando'
import { Constants, DiscordAPIError, Intents } from 'discord.js'
import AroraProvider from './setting-provider'
import type BaseHandler from './base'
import { CommandoClient } from 'discord.js-commando'
import { WebSocketManager } from './websocket'
import applicationConfig from '../configs/application'
import { constants } from '../util'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'
import path from 'path'

const { PartialTypes } = Constants
const { TYPES } = constants
const { lazyInject } = getDecorators(container)

const ACTIVITY_CAROUSEL_INTERVAL = 60 * 1000

declare module 'discord.js' {
  interface Client {
    mainGuild: Guild | null

    startActivityCarousel: () => Promise<Presence | null>
    stopActivityCarousel: () => void
    nextActivity: (activity?: number) => Promise<Presence>
    send: (
      user: GuildMember | PartialGuildMember | User,
      content: string | APIMessage | MessageOptions
    ) => Promise<Message | Message[] | null>
  }
}

export default class AroraClient extends CommandoClient {
  @lazyInject(TYPES.PacketHandlerFactory)
  public readonly packetHandlerFactory!: (eventName: string) => BaseHandler

  @lazyInject(TYPES.EventHandlerFactory)
  private readonly eventHandlerFactory!: (eventName: string) => BaseHandler

  private readonly aroraWs: WebSocketManager | null
  private currentActivity: number
  private activityCarouselInterval: NodeJS.Timeout | null

  public constructor (options: CommandoClientOptions = {}) {
    if (typeof options.commandPrefix === 'undefined') {
      options.commandPrefix = applicationConfig.defaultPrefix
    }
    if (typeof options.owner === 'undefined') {
      options.owner = applicationConfig.owner
    }
    if (typeof options.invite === 'undefined') {
      options.invite = applicationConfig.invite
    }
    if (typeof options.ws === 'undefined') {
      options.ws = {}
    }
    if (typeof options.ws.intents === 'undefined') {
      options.ws.intents = []
    }
    const intentsArray = options.ws.intents as number[]
    if (!intentsArray.includes(Intents.FLAGS.GUILDS)) {
      intentsArray.push(Intents.FLAGS.GUILDS)
    }
    if (!intentsArray.includes(Intents.FLAGS.GUILD_MEMBERS)) {
      intentsArray.push(Intents.FLAGS.GUILD_MEMBERS)
    }
    if (!intentsArray.includes(Intents.FLAGS.GUILD_VOICE_STATES)) {
      intentsArray.push(Intents.FLAGS.GUILD_VOICE_STATES)
    }
    if (!intentsArray.includes(Intents.FLAGS.GUILD_MESSAGES)) {
      intentsArray.push(Intents.FLAGS.GUILD_MESSAGES)
    }
    if (!intentsArray.includes(Intents.FLAGS.GUILD_MESSAGE_REACTIONS)) {
      intentsArray.push(Intents.FLAGS.GUILD_MESSAGE_REACTIONS)
    }
    if (!intentsArray.includes(Intents.FLAGS.DIRECT_MESSAGES)) {
      intentsArray.push(Intents.FLAGS.DIRECT_MESSAGES)
    }
    if (typeof options.partials === 'undefined') {
      options.partials = []
    }
    if (!options.partials.includes(PartialTypes.GUILD_MEMBER)) {
      options.partials.push(PartialTypes.GUILD_MEMBER)
    }
    if (!options.partials.includes(PartialTypes.REACTION)) {
      options.partials.push(PartialTypes.REACTION)
    }
    if (!options.partials.includes(PartialTypes.MESSAGE)) {
      options.partials.push(PartialTypes.MESSAGE)
    }
    if (!options.partials.includes(PartialTypes.USER)) {
      options.partials.push(PartialTypes.USER)
    }
    super(options)

    this.mainGuild = null

    this.currentActivity = 0
    this.activityCarouselInterval = null

    this.registry
      .registerDefaultGroups()
      .registerDefaultTypes({ message: false })
      .registerDefaultCommands({
        help: true,
        prefix: true,
        eval: true,
        ping: true,
        unknownCommand: false,
        commandState: true
      })
      .unregisterCommand(this.registry.resolveCommand('groups')) // returns void..
    this.registry
      .registerGroup('admin', 'Admin')
      .registerGroup('bot', 'Bot')
      .registerGroup('main', 'Main')
      .registerGroup('settings', 'Settings')
      .registerTypesIn({ dirname: path.join(__dirname, '../types'), filter: /^(?!base\.js|.*\.d\.).*/ })
      .registerCommandsIn({ dirname: path.join(__dirname, '../commands'), filter: /^(?!base\.js|.*\.d\.).*/ })

    this.dispatcher.addInhibitor(requiresApiInhibitor)
    this.dispatcher.addInhibitor(requiresRobloxGroupInhibitor)
    this.dispatcher.addInhibitor(requiresSingleGuildInhibitor)

    this.aroraWs = applicationConfig.apiEnabled === true ? new WebSocketManager(this) : null

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.once('ready', this.ready.bind(this))
  }

  private async ready (): Promise<void> {
    await this.setProvider(new AroraProvider())

    const mainGuildId = process.env.NODE_ENV === 'production'
      ? applicationConfig.productionMainGuildId
      : applicationConfig.developmentMainGuildId
    this.mainGuild = this.guilds.cache.get(mainGuildId) ?? null

    this.bindEvent('channelDelete')
    this.bindEvent('commandCancel')
    this.bindEvent('commandError')
    this.bindEvent('commandPrefixChange')
    this.bindEvent('commandRun')
    this.bindEvent('commandStatusChange')
    this.bindEvent('emojiDelete')
    this.bindEvent('groupStatusChange')
    this.bindEvent('guildCreate')
    this.bindEvent('guildMemberAdd')
    this.bindEvent('guildMemberUpdate')
    this.bindEvent('message')
    this.bindEvent('messageDelete')
    this.bindEvent('messageDeleteBulk')
    this.bindEvent('messageReactionAdd')
    this.bindEvent('messageReactionRemove')
    this.bindEvent('roleDelete')
    this.bindEvent('voiceStateUpdate')

    await this.startActivityCarousel()

    console.log(`Ready to serve on ${this.guilds.cache.size} servers, for ${this.users.cache.size} users.`)
  }

  // @ts-expect-error
  public override async startActivityCarousel (): Promise<Presence | null> {
    if (this.activityCarouselInterval == null) {
      this.activityCarouselInterval = this.setInterval(() => this.nextActivity.bind(this), ACTIVITY_CAROUSEL_INTERVAL)
      return await this.nextActivity(0)
    }
    return null
  }

  // @ts-expect-error
  public override stopActivityCarousel (): void {
    if (this.activityCarouselInterval !== null) {
      this.clearInterval(this.activityCarouselInterval)
      this.activityCarouselInterval = null
    }
  }

  // @ts-expect-error
  public override async nextActivity (activity?: number): Promise<Presence> {
    if (this.user === null) {
      throw new Error('Can\'t set activity when the client is not logged in.')
    }

    this.currentActivity = (activity ?? this.currentActivity + 1) % 2
    switch (this.currentActivity) {
      case 0: {
        let totalMemberCount = 0
        for (const guild of this.guilds.cache.values()) {
          totalMemberCount += guild.memberCount
        }
        return await this.user.setActivity(`${totalMemberCount} users`, { type: 'WATCHING' })
      }
      default:
        return await this.user.setActivity(`${this.commandPrefix}help`, { type: 'LISTENING' })
    }
  }

  // @ts-expect-error
  public override async send (
    user: GuildMember | PartialGuildMember | User,
    content: string | APIMessage | MessageOptions
  ): Promise<Message | Message[] | null> {
    return await failSilently(user.send.bind(user, content), [50007])
    // 50007: Cannot send messages to this user, user probably has DMs closed.
  }

  public override async login (token = this.token): Promise<string> {
    const usedToken = await super.login(token ?? undefined)
    this.aroraWs?.connect()
    return usedToken
  }

  // See comment in discord.js-commando imports.
  // private bindEvent (eventName: CommandoClientEvents): void {
  private bindEvent (eventName: string): void {
    const handler = this.eventHandlerFactory(eventName)
    // @ts-expect-error FIXME: eventName keyof ClientEvents & async listener
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.on(eventName, handler.handle.bind(handler, this))
  }
}

function requiresApiInhibitor (msg: CommandoMessage): false | Inhibition {
  if (msg.command?.requiresApi === true && applicationConfig.apiEnabled !== true) {
    return {
      reason: 'apiRequired',
      response: msg.reply('This command requires that the bot has an API connected.')
    }
  }
  return false
}

function requiresRobloxGroupInhibitor (msg: CommandoMessage): false | Inhibition {
  if (msg.command?.requiresRobloxGroup === true && (msg.guild === null || msg.guild.robloxGroupId === null)) {
    return {
      reason: 'robloxGroupRequired',
      response: msg.reply('This command requires that the server has its robloxGroup setting set.')
    }
  }
  return false
}

function requiresSingleGuildInhibitor (msg: CommandoMessage): false | Inhibition {
  if (msg.command?.requiresSingleGuild === true && msg.client.guilds.cache.size !== 1) {
    return {
      reason: 'singleGuildRequired',
      response: msg.reply('This command requires the bot to be in only one guild.')
    }
  }
  return false
}

async function failSilently (
  fn: ((...args: any[]) => any | Promise<any>),
  codes: number[]
): Promise<any> {
  try {
    return await Promise.resolve(fn())
  } catch (err) {
    if (!(err instanceof DiscordAPIError) || !codes.includes(err.code)) {
      throw err
    }
    return null
  }
}

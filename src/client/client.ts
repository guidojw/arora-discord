import { Client, Constants, DiscordAPIError, Intents } from 'discord.js'
import type {
  ClientEvents,
  ClientOptions,
  GuildMember,
  Message,
  MessageOptions,
  MessagePayload,
  PartialGuildMember,
  Presence,
  User
} from 'discord.js'
import type { BaseArgumentType } from '../types'
import type BaseHandler from './base'
import Dispatcher from './dispatcher'
import SettingProvider from './setting-provider'
import { WebSocketManager } from './websocket'
import applicationConfig from '../configs/application'
import { constants } from '../util'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

const { PartialTypes } = Constants
const { TYPES } = constants
const { lazyInject } = getDecorators(container)

const ACTIVITY_CAROUSEL_INTERVAL = 60 * 1000

declare module 'discord.js' {
  interface Client {
    dispatcher: Dispatcher
    provider: SettingProvider
    mainGuild: Guild | null

    startActivityCarousel: () => Presence | null
    stopActivityCarousel: () => void
    nextActivity: (activity?: number) => Presence
    send: (
      user: GuildMember | PartialGuildMember | User,
      content: string | MessagePayload | MessageOptions
    ) => Promise<Message>
  }
}

export default class AroraClient<Ready extends boolean = boolean> extends Client<Ready> {
  @lazyInject(TYPES.ArgumentTypeFactory)
  public readonly argumentTypeFactory!: (argumentTypeName: string) => BaseArgumentType<any> | undefined

  @lazyInject(TYPES.EventHandlerFactory)
  private readonly eventHandlerFactory!: (eventName: string) => BaseHandler

  @lazyInject(TYPES.PacketHandlerFactory)
  public readonly packetHandlerFactory!: (eventName: string) => BaseHandler

  private readonly aroraWs: WebSocketManager | null
  private currentActivity: number
  private activityCarouselInterval: NodeJS.Timeout | null

  public constructor (options: ClientOptions = { intents: [] }) {
    const intentsArray = options.intents as number[]
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
    if (!intentsArray.includes(Intents.FLAGS.DIRECT_MESSAGE_REACTIONS)) {
      intentsArray.push(Intents.FLAGS.DIRECT_MESSAGE_REACTIONS)
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

    this.dispatcher = new Dispatcher(this)
    this.provider = new SettingProvider()

    this.mainGuild = null

    this.currentActivity = 0
    this.activityCarouselInterval = null

    this.aroraWs = applicationConfig.apiEnabled === true ? new WebSocketManager(this) : null

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.once('ready', this.ready.bind(this))
  }

  private async ready (): Promise<void> {
    await this.provider.init(this)

    const mainGuildId = process.env.NODE_ENV === 'production'
      ? applicationConfig.productionMainGuildId
      : applicationConfig.developmentMainGuildId
    this.mainGuild = this.guilds.cache.get(mainGuildId) ?? null

    this.bindEvent('channelDelete')
    this.bindEvent('emojiDelete')
    this.bindEvent('guildCreate')
    this.bindEvent('guildMemberAdd')
    this.bindEvent('guildMemberUpdate')
    this.bindEvent('interactionCreate')
    this.bindEvent('messageCreate')
    this.bindEvent('messageDelete')
    this.bindEvent('messageDeleteBulk')
    this.bindEvent('messageReactionAdd')
    this.bindEvent('messageReactionRemove')
    this.bindEvent('roleDelete')
    this.bindEvent('voiceStateUpdate')

    this.startActivityCarousel()

    console.log(`Ready to serve on ${this.guilds.cache.size} servers, for ${this.users.cache.size} users.`)
  }

  // @ts-expect-error
  public override startActivityCarousel (): Presence | null {
    if (this.activityCarouselInterval === null) {
      this.activityCarouselInterval = setInterval(this.nextActivity.bind(this), ACTIVITY_CAROUSEL_INTERVAL).unref()
      return this.nextActivity(0)
    }
    return null
  }

  // @ts-expect-error
  public override stopActivityCarousel (): void {
    if (this.activityCarouselInterval !== null) {
      clearInterval(this.activityCarouselInterval)
      this.activityCarouselInterval = null
    }
  }

  // @ts-expect-error
  public override nextActivity (activity?: number): Presence {
    if (this.user === null) {
      throw new Error('Can\'t set activity when the client is not logged in.')
    }

    this.currentActivity = (activity ?? this.currentActivity + 1) % 1
    switch (this.currentActivity) {
      default: {
        let totalMemberCount = 0
        for (const guild of this.guilds.cache.values()) {
          totalMemberCount += guild.memberCount
        }
        return this.user.setActivity(`${totalMemberCount} users`, { type: 'WATCHING' })
      }
    }
  }

  // @ts-expect-error
  public override async send (
    user: GuildMember | PartialGuildMember | User,
    content: string | MessagePayload | MessageOptions
  ): Promise<Message> {
    return await failSilently(user.send.bind(user, content), [50007])
    // 50007: Cannot send messages to this user, user probably has DMs closed.
  }

  public override async login (token = this.token): Promise<string> {
    const usedToken = await super.login(token ?? undefined)
    this.aroraWs?.connect()
    return usedToken
  }

  private bindEvent (eventName: keyof ClientEvents): void {
    const handler = this.eventHandlerFactory(eventName)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.on(eventName, handler.handle.bind(handler, this))
  }
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

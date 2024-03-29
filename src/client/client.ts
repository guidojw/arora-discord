import {
  ActivityType,
  Client,
  type ClientEvents,
  DiscordAPIError,
  GatewayIntentBits,
  type Guild,
  type Message,
  type PartialTextBasedChannelFields,
  Partials,
  type Presence
} from 'discord.js'
import { type AnyFunction, constants } from '../utils'
import { type BaseHandler, SettingProvider, WebSocketManager } from '.'
import { decorate, inject, injectable, type interfaces, optional } from 'inversify'
import applicationConfig from '../configs/application'

const { TYPES } = constants

const ACTIVITY_CAROUSEL_INTERVAL = 60_000
const REQUIRED_INTENTS: GatewayIntentBits[] = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.DirectMessageReactions
]
const REQUIRED_PARTIALS: Partials[] = [
  Partials.GuildMember,
  Partials.Reaction,
  Partials.Message,
  Partials.User
]

decorate(injectable(), Client)

@injectable()
export default class AroraClient<Ready extends boolean = boolean> extends Client<Ready> {
  @inject(TYPES.EventHandlerFactory)
  private readonly eventHandlerFactory!: interfaces.AutoNamedFactory<BaseHandler>

  @inject(TYPES.SettingProvider)
  private readonly settingProvider!: SettingProvider

  @inject(TYPES.WebSocketManager)
  @optional()
  private readonly aroraWs?: WebSocketManager

  public mainGuild: Guild | null = null

  private currentActivity: number = 0
  private activityCarouselInterval: NodeJS.Timeout | null = null

  public constructor () {
    super({ intents: REQUIRED_INTENTS, partials: REQUIRED_PARTIALS })

    this.once('ready', this.ready.bind(this))
  }

  private async ready (): Promise<void> {
    await this.settingProvider.init(this)

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

  public startActivityCarousel (): Presence | null {
    if (this.activityCarouselInterval === null) {
      this.activityCarouselInterval = setInterval(this.nextActivity.bind(this), ACTIVITY_CAROUSEL_INTERVAL).unref()
      return this.nextActivity(0)
    }
    return null
  }

  public stopActivityCarousel (): void {
    if (this.activityCarouselInterval !== null) {
      clearInterval(this.activityCarouselInterval)
      this.activityCarouselInterval = null
    }
  }

  public nextActivity (activity?: number): Presence {
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
        return this.user.setActivity(`${totalMemberCount} users`, { type: ActivityType.Watching })
      }
    }
  }

  public async send (
    user: PartialTextBasedChannelFields,
    ...args: Parameters<PartialTextBasedChannelFields['send']>
  ): Promise<Message | null> {
    return await failSilently(user.send.bind(user, ...args), [50007])
    // 50007: Cannot send messages to this user, user probably has DMs closed.
  }

  public override async login (token?: string): Promise<string> {
    const usedToken = await super.login(token)
    this.aroraWs?.connect()
    return usedToken
  }

  private bindEvent (eventName: keyof ClientEvents): void {
    const handler = this.eventHandlerFactory(eventName)
    this.on(eventName, handler.handle.bind(handler))
  }
}

async function failSilently<T extends AnyFunction> (fn: T, codes: number[]): Promise<ReturnType<T> | null> {
  try {
    return await Promise.resolve(fn())
  } catch (err) {
    if (!(err instanceof DiscordAPIError) || (typeof err.code === 'number' && !codes.includes(err.code))) {
      throw err
    }
    return null
  }
}

import {
  Client,
  type ClientEvents,
  type ClientOptions,
  Constants,
  DiscordAPIError,
  Intents,
  type Message,
  type PartialTextBasedChannelFields,
  type Presence
} from 'discord.js'
import type { BaseArgumentType } from '../types'
import type BaseHandler from './base'
import Dispatcher from './dispatcher'
import { GuildContextManager } from '../managers'
import SettingProvider from './setting-provider'
import { WebSocketManager } from './websocket'
import applicationConfig from '../configs/application'
import { constants } from '../utils'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

const { PartialTypes } = Constants
const { TYPES } = constants
const { lazyInject } = getDecorators(container)

const ACTIVITY_CAROUSEL_INTERVAL = 60_000
const REQUIRED_INTENTS: number[] = [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_VOICE_STATES,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.DIRECT_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
]
const REQUIRED_PARTIALS: Array<keyof typeof PartialTypes> = [
  PartialTypes.GUILD_MEMBER,
  PartialTypes.REACTION,
  PartialTypes.MESSAGE,
  PartialTypes.USER
]

declare module 'discord.js' {
  interface Client {
    guildContexts: GuildContextManager

    dispatcher: Dispatcher
    provider: SettingProvider
    mainGuild: Guild | null

    startActivityCarousel (): Presence | null
    stopActivityCarousel (): void
    nextActivity (activity?: number): Presence
    send (
      user: PartialTextBasedChannelFields,
      ...args: Parameters<PartialTextBasedChannelFields['send']>
    ): Promise<Message>
  }
}

export default class AroraClient<Ready extends boolean = boolean> extends Client<Ready> {
  @lazyInject(TYPES.ArgumentTypeFactory)
  public readonly argumentTypeFactory!: (argumentTypeName: string) => BaseArgumentType<any> | undefined

  @lazyInject(TYPES.PacketHandlerFactory)
  public readonly packetHandlerFactory!: (eventName: string) => BaseHandler

  @lazyInject(TYPES.EventHandlerFactory)
  private readonly eventHandlerFactory!: (eventName: string) => BaseHandler

  private readonly aroraWs: WebSocketManager | null
  private currentActivity: number
  private activityCarouselInterval: NodeJS.Timeout | null

  public constructor (options: ClientOptions = { intents: [] }) {
    options.intents = new Intents(options.intents)
    options.intents.add(...REQUIRED_INTENTS)
    options.partials = [...new Set(
      ...options.partials ?? [],
      ...REQUIRED_PARTIALS
    )] as Array<keyof typeof PartialTypes>
    super(options)

    this.guildContexts = new GuildContextManager(this)

    this.dispatcher = new Dispatcher()
    this.provider = new SettingProvider()

    this.mainGuild = null

    this.currentActivity = 0
    this.activityCarouselInterval = null

    this.aroraWs = applicationConfig.apiEnabled === true ? new WebSocketManager(this) : null

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

  public override startActivityCarousel (): Presence | null {
    if (this.activityCarouselInterval === null) {
      this.activityCarouselInterval = setInterval(this.nextActivity.bind(this), ACTIVITY_CAROUSEL_INTERVAL).unref()
      return this.nextActivity(0)
    }
    return null
  }

  public override stopActivityCarousel (): void {
    if (this.activityCarouselInterval !== null) {
      clearInterval(this.activityCarouselInterval)
      this.activityCarouselInterval = null
    }
  }

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

  public override async send (
    user: PartialTextBasedChannelFields,
    ...args: Parameters<PartialTextBasedChannelFields['send']>
  ): Promise<Message> {
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

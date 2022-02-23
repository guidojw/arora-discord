import {
  type CategoryChannel,
  Collection,
  type ColorResolvable,
  type Guild,
  GuildEmoji,
  type GuildMember,
  type Message,
  MessageEmbed,
  type MessageReaction,
  type Snowflake,
  type TextChannel,
  type User
} from 'discord.js'
import {
  GuildGroupManager,
  GuildPanelManager,
  GuildRoleBindingManager,
  GuildRoleMessageManager,
  GuildTagManager,
  GuildTicketManager,
  GuildTicketTypeManager
} from '../managers'
import type { AroraClient } from '../client'
import type { BaseJob } from '../jobs'
import BaseStructure from './base'
import type { Guild as GuildEntity } from '../entities'
import type { Repository } from 'typeorm'
import type { VerificationProvider } from '../utils/constants'
import applicationConfig from '../configs/application'
import { constants } from '../utils'
import container from '../configs/container'
import cron from 'node-cron'
import cronConfig from '../configs/cron'
import getDecorators from 'inversify-inject-decorators'

export enum GuildContextSetting {
  logsChannelId,
  primaryColor,
  ratingsChannelId,
  robloxGroupId,
  robloxUsernamesInNicknames,
  suggestionsChannelId,
  ticketArchivesChannelId,
  ticketsCategoryId,
  verificationPreference
}

export interface GuildContextUpdateOptions {
  logsChannelId?: Snowflake | null
  primaryColor?: number | null
  ratingsChannelId?: Snowflake | null
  robloxGroupId?: number | null
  robloxUsernamesInNicknames?: boolean
  suggestionsChannelId?: Snowflake | null
  supportEnabled?: boolean
  ticketArchivesChannelId?: Snowflake | null
  ticketsCategoryId?: Snowflake | null
  verificationPreference?: VerificationProvider
}

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

const memberNameRegex = (name: string): RegExp => new RegExp(`^(${name})$|\\s*[(](${name})[)]\\s*`)

export default class GuildContext extends BaseStructure {
  @lazyInject(TYPES.GuildRepository)
  private readonly guildRepository!: Repository<GuildEntity>

  @lazyInject(TYPES.JobFactory)
  private readonly jobFactory!: (jobName: string) => BaseJob

  public readonly guild: Guild

  public readonly groups: GuildGroupManager
  public readonly panels: GuildPanelManager
  public readonly roleBindings: GuildRoleBindingManager
  public readonly roleMessages: GuildRoleMessageManager
  public readonly tags: GuildTagManager
  public readonly tickets: GuildTicketManager
  public readonly ticketTypes: GuildTicketTypeManager

  public logsChannelId!: Snowflake | null
  public primaryColor!: number | null
  public ratingsChannelId!: Snowflake | null
  public robloxGroupId!: number | null
  public robloxUsernamesInNicknames!: boolean
  public suggestionsChannelId!: Snowflake | null
  public supportEnabled!: boolean
  public ticketArchivesChannelId!: Snowflake | null
  public ticketsCategoryId!: Snowflake | null
  public verificationPreference!: VerificationProvider

  public constructor (client: AroraClient<true>, data: GuildEntity, guild: Guild) {
    super(client)

    this.guild = guild

    this.groups = new GuildGroupManager(this)
    this.panels = new GuildPanelManager(this)
    this.roleBindings = new GuildRoleBindingManager(this)
    this.roleMessages = new GuildRoleMessageManager(this)
    this.tags = new GuildTagManager(this)
    this.tickets = new GuildTicketManager(this)
    this.ticketTypes = new GuildTicketTypeManager(this)

    this.setup(data)
  }

  public setup (data: GuildEntity): void {
    this.logsChannelId = data.logsChannelId ?? null
    this.primaryColor = data.primaryColor ?? null
    this.ratingsChannelId = data.ratingsChannelId ?? null
    this.robloxGroupId = data.robloxGroupId ?? null
    this.robloxUsernamesInNicknames = data.robloxUsernamesInNicknames
    this.suggestionsChannelId = data.suggestionsChannelId ?? null
    this.supportEnabled = data.supportEnabled
    this.ticketArchivesChannelId = data.ticketArchivesChannelId ?? null
    this.ticketsCategoryId = data.ticketsCategoryId ?? null
    this.verificationPreference = data.verificationPreference

    if (typeof data.groups !== 'undefined') {
      for (const rawGroup of data.groups) {
        this.groups._add(rawGroup)
      }
    }

    if (typeof data.panels !== 'undefined') {
      for (const rawPanel of data.panels) {
        this.panels._add(rawPanel)
      }
    }

    if (typeof data.roleBindings !== 'undefined') {
      for (const rawRoleBinding of data.roleBindings) {
        this.roleBindings._add(rawRoleBinding)
      }
    }

    if (typeof data.roleMessages !== 'undefined') {
      for (const rawRoleMessage of data.roleMessages) {
        this.roleMessages._add(rawRoleMessage)
      }
    }

    if (typeof data.tags !== 'undefined') {
      for (const rawTag of data.tags) {
        this.tags._add(rawTag)
      }
    }

    if (typeof data.tickets !== 'undefined') {
      for (const rawTicket of data.tickets) {
        this.tickets._add(rawTicket)
      }
    }

    if (typeof data.ticketTypes !== 'undefined') {
      for (const rawTicketType of data.ticketTypes) {
        this.ticketTypes._add(rawTicketType)
      }
    }
  }

  public init (): void {
    if (applicationConfig.apiEnabled === true) {
      const announceTrainingsJobConfig = cronConfig.announceTrainingsJob
      const announceTrainingsJob = this.jobFactory(announceTrainingsJobConfig.name)
      cron.schedule(
        announceTrainingsJobConfig.expression,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        announceTrainingsJob.run.bind(announceTrainingsJob, this)
      )
    }

    const premiumMembersReportJobConfig = cronConfig.premiumMembersReportJob
    const premiumMembersReportJob = this.jobFactory(premiumMembersReportJobConfig.name)
    cron.schedule(
      premiumMembersReportJobConfig.expression,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      premiumMembersReportJob.run.bind(premiumMembersReportJob, this)
    )
  }

  public get id (): string {
    return this.guild.id
  }

  public get logsChannel (): TextChannel | null {
    return this.logsChannelId !== null
      ? (this.guild.channels.cache.get(this.logsChannelId) as TextChannel | undefined) ?? null
      : null
  }

  public get ratingsChannel (): TextChannel | null {
    return this.ratingsChannelId !== null
      ? (this.guild.channels.cache.get(this.ratingsChannelId) as TextChannel | undefined) ?? null
      : null
  }

  public get suggestionsChannel (): TextChannel | null {
    return this.suggestionsChannelId !== null
      ? (this.guild.channels.cache.get(this.suggestionsChannelId) as TextChannel | undefined) ?? null
      : null
  }

  public get ticketArchivesChannel (): TextChannel | null {
    return this.ticketArchivesChannelId !== null
      ? (this.guild.channels.cache.get(this.ticketArchivesChannelId) as TextChannel | undefined) ?? null
      : null
  }

  public get ticketsCategory (): CategoryChannel | null {
    return this.ticketsCategoryId !== null
      ? (this.guild.channels.cache.get(this.ticketsCategoryId) as CategoryChannel | undefined) ?? null
      : null
  }

  public async fetchMembersByRobloxUsername (username: string): Promise<Collection<Snowflake, GuildMember>> {
    if (this.robloxUsernamesInNicknames) {
      const regex = memberNameRegex(username)
      return (await this.guild.members.fetch()).filter(member => regex.test(member.displayName))
    } else {
      return new Collection()
    }
  }

  public async handleRoleMessage (
    type: 'add' | 'remove',
    reaction: MessageReaction,
    user: User
  ): Promise<void> {
    const member = await this.guild.members.fetch(user)
    for (const roleMessage of this.roleMessages.cache.values()) {
      if (
        reaction.message.id === roleMessage.messageId && (reaction.emoji instanceof GuildEmoji
          ? roleMessage.emoji instanceof GuildEmoji && reaction.emoji.id === roleMessage.emojiId
          : !(roleMessage.emoji instanceof GuildEmoji) && reaction.emoji.name === roleMessage.emojiId)
      ) {
        await member.roles[type](roleMessage.roleId)
      }
    }
  }

  public async log (
    author: User,
    content: string,
    options: { color?: ColorResolvable, footer?: string } = {}
  ): Promise<Message | null> {
    if (this.logsChannel !== null) {
      if (author.partial) {
        await author.fetch()
      }

      const embed = new MessageEmbed()
        .setAuthor({ name: author.tag, iconURL: author.displayAvatarURL() })
        .setColor(this.primaryColor ?? applicationConfig.defaultColor)
        .setDescription(content)
      if (typeof options.color !== 'undefined') {
        embed.setColor(options.color)
      }
      if (typeof options.footer !== 'undefined') {
        embed.setFooter({ text: options.footer })
      }

      return await this.logsChannel.send({ embeds: [embed] })
    }
    return null
  }

  public async update (data: GuildContextUpdateOptions): Promise<this> {
    await this.guildRepository.save(this.guildRepository.create({
      id: this.guild.id,
      ...data
    }))
    const newData = await this.guildRepository.findOne(this.guild.id) as GuildEntity

    this.setup(newData)
    return this
  }
}

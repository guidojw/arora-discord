import {
  type CategoryChannel,
  type CategoryChannelResolvable,
  Collection,
  type ColorResolvable,
  EmbedBuilder,
  type Guild,
  GuildEmoji,
  type GuildMember,
  type Message,
  type MessageReaction,
  type Snowflake,
  type TextChannel,
  type TextChannelResolvable,
  type User
} from 'discord.js'
import type { Group, Panel, RoleBinding, RoleMessage, Tag, Ticket, TicketType } from '.'
import {
  GuildContextManager,
  type GuildGroupManager,
  type GuildPanelManager,
  type GuildRoleBindingManager,
  type GuildRoleMessageManager,
  type GuildTagManager,
  type GuildTicketManager,
  type GuildTicketTypeManager
} from '../managers'
import { type ManagerFactory, constants } from '../utils'
import { inject, injectable, type interfaces, named } from 'inversify'
import type { BaseJob } from '../jobs'
import BaseStructure from './base'
import type { Guild as GuildEntity } from '../entities'
import type { VerificationProvider } from '../utils/constants'
import applicationConfig from '../configs/application'
import cron from 'node-cron'
import cronConfig from '../configs/cron'

const { TYPES } = constants

const memberNameRegex = (name: string): RegExp => new RegExp(`^(${name})$|\\s*[(](${name})[)]\\s*`)

export interface GuildUpdateOptions {
  logsChannel?: TextChannelResolvable | null
  primaryColor?: number | null
  ratingsChannel?: TextChannelResolvable | null
  robloxGroup?: number | null
  robloxUsernamesInNicknames?: boolean
  suggestionsChannel?: TextChannelResolvable | null
  supportEnabled?: boolean
  ticketArchivesChannel?: TextChannelResolvable | null
  ticketsCategory?: CategoryChannelResolvable | null
  verificationPreference?: VerificationProvider
}

@injectable()
export default class GuildContext extends BaseStructure<GuildEntity> {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  @inject(TYPES.JobFactory)
  public readonly jobFactory!: interfaces.AutoNamedFactory<BaseJob>

  public readonly groups: GuildGroupManager
  public readonly panels: GuildPanelManager
  public readonly roleBindings: GuildRoleBindingManager
  public readonly roleMessages: GuildRoleMessageManager
  public readonly tags: GuildTagManager
  public readonly tickets: GuildTicketManager
  public readonly ticketTypes: GuildTicketTypeManager

  public guild!: Guild

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

  public constructor (@inject(TYPES.ManagerFactory) managerFactory: ManagerFactory) {
    super()

    this.groups = managerFactory<GuildGroupManager, Group>('GuildGroupManager')(this)
    this.panels = managerFactory<GuildPanelManager, Panel>('GuildPanelManager')(this)
    this.roleBindings = managerFactory<GuildRoleBindingManager, RoleBinding>('GuildRoleBindingManager')(this)
    this.roleMessages = managerFactory<GuildRoleMessageManager, RoleMessage>('GuildRoleMessageManager')(this)
    this.tags = managerFactory<GuildTagManager, Tag>('GuildTagManager')(this)
    this.tickets = managerFactory<GuildTicketManager, Ticket>('GuildTicketManager')(this)
    this.ticketTypes = managerFactory<GuildTicketTypeManager, TicketType>('GuildTicketTypeManager')(this)
  }

  public setOptions (data: GuildEntity, guild: Guild): void {
    this.guild = guild

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
        this.groups.add(rawGroup)
      }
    }

    if (typeof data.panels !== 'undefined') {
      for (const rawPanel of data.panels) {
        this.panels.add(rawPanel)
      }
    }

    if (typeof data.roleBindings !== 'undefined') {
      for (const rawRoleBinding of data.roleBindings) {
        this.roleBindings.add(rawRoleBinding)
      }
    }

    if (typeof data.roleMessages !== 'undefined') {
      for (const rawRoleMessage of data.roleMessages) {
        this.roleMessages.add(rawRoleMessage)
      }
    }

    if (typeof data.tags !== 'undefined') {
      for (const rawTag of data.tags) {
        this.tags.add(rawTag)
      }
    }

    if (typeof data.tickets !== 'undefined') {
      for (const rawTicket of data.tickets) {
        this.tickets.add(rawTicket)
      }
    }

    if (typeof data.ticketTypes !== 'undefined') {
      for (const rawTicketType of data.ticketTypes) {
        this.ticketTypes.add(rawTicketType)
      }
    }
  }

  public init (): void {
    if (applicationConfig.apiEnabled === true) {
      const announceTrainingsJobConfig = cronConfig.announceTrainingsJob
      const announceTrainingsJob = this.jobFactory(announceTrainingsJobConfig.name)
      cron.schedule(announceTrainingsJobConfig.expression, () => {
        Promise.resolve(announceTrainingsJob.run(this)).catch(console.error)
      })
    }

    const premiumMembersReportJobConfig = cronConfig.premiumMembersReportJob
    const premiumMembersReportJob = this.jobFactory(premiumMembersReportJobConfig.name)
    cron.schedule(premiumMembersReportJobConfig.expression, () => {
      Promise.resolve(premiumMembersReportJob.run(this)).catch(console.error)
    })
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

      const embed = new EmbedBuilder()
        .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
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

  public async update (data: GuildUpdateOptions): Promise<GuildContext> {
    return await this.guildContexts.update(this, data)
  }
}

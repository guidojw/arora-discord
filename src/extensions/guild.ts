import type {
  CategoryChannel,
  Client,
  ColorResolvable,
  Guild,
  Message,
  MessageReaction,
  TextChannel,
  User
} from 'discord.js'
import { GuildEmoji, MessageEmbed, Structures } from 'discord.js'
import {
  GuildGroupManager,
  GuildMemberManager,
  GuildPanelManager,
  GuildRoleBindingManager,
  GuildRoleMessageManager,
  GuildTagManager,
  GuildTicketManager,
  GuildTicketTypeManager
} from '../managers'
import type { BaseStructure } from '../structures'
import type { Guild as GuildEntity } from '../entities'
import { Guild as GuildModel } from '../models'
import type { VerificationProvider } from '../util/constants'
import applicationConfig from '../configs/application'
import cron from 'node-cron'
import cronConfig from '../configs/cron'

declare module 'discord.js' {
  interface Guild {
    logsChannelId: string | null
    primaryColor: number | null
    ratingsChannelId: string | null
    robloxGroupId: number | null
    robloxUsernamesInNicknames: boolean
    suggestionsChannelId: string | null
    supportEnabled: boolean
    ticketArchivesChannelId: string | null
    ticketsCategoryId: string | null
    trainingsInfoPanelId: number | null
    trainingsPanelId: number | null
    verificationPreference: VerificationProvider

    members: GuildMemberManager
    groups: GuildGroupManager
    panels: GuildPanelManager
    roleBindings: GuildRoleBindingManager
    roleMessages: GuildRoleMessageManager
    tags: GuildTagManager
    tickets: GuildTicketManager
    ticketTypes: GuildTicketTypeManager

    readonly logsChannel: TextChannel | null
    readonly suggestionsChannel: TextChannel | null
    readonly ratingsChannel: TextChannel | null
    readonly ticketArchivesChannel: TextChannel | null
    readonly ticketsCategory: CategoryChannel | null

    setup: (data: GuildEntity) => void
    init: () => Promise<void>
    handleRoleMessage: (type: 'add' | 'remove', reaction: MessageReaction, user: User) => Promise<void>
    log: (
      author: User,
      content: string,
      options?: { color?: ColorResolvable, footer?: string }
    ) => Promise<Message | null>
    update: (data: Partial<GuildEntity>) => Promise<this>
  }
}

// @ts-expect-error
const AroraGuild: Guild = Structures.extend('Guild', Guild => (
  class AroraGuild extends Guild implements Omit<BaseStructure, 'client'> {
    public constructor (client: Client, data: object) {
      super(client, data)

      this.members = new GuildMemberManager(this)
      this.groups = new GuildGroupManager(this)
      this.panels = new GuildPanelManager(this)
      this.roleBindings = new GuildRoleBindingManager(this)
      this.roleMessages = new GuildRoleMessageManager(this)
      this.tags = new GuildTagManager(this)
      this.tickets = new GuildTicketManager(this)
      this.ticketTypes = new GuildTicketTypeManager(this)
    }

    // @ts-expect-error
    public override setup (data: GuildEntity): void {
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

      if (typeof data.roles !== 'undefined') {
        for (const rawRole of data.roles) {
          const role = this.roles.cache.get(rawRole.id)
          if (typeof role !== 'undefined') {
            role.setup(rawRole)
          }
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

    public _patch (data: any): void {
      // Below patch was done so that Discord.js' Guild._patch method doesn't clear the roles manager which makes it
      // lose all data. When channels ever get data that needs to be cached, this has to be done on that manager too.
      const roles: any[] = data.roles
      delete data.roles

      // @ts-expect-error
      super._patch(data)

      for (const roleData of roles) {
        const role = this.roles.cache.get(roleData.id)
        if (typeof role !== 'undefined') {
          // @ts-expect-error
          role._patch(roleData)
        } else {
          this.roles.add(roleData)
        }
      }
      for (const role of this.roles.cache.values()) {
        if (!roles.some(roleData => roleData.id === role.id)) {
          this.roles.cache.delete(role.id)
        }
      }
    }

    // @ts-expect-error
    public override async init (): Promise<void> {
      if (applicationConfig.apiEnabled === true) {
        const announceTrainingsJobConfig = cronConfig.announceTrainingsJob
        cron.schedule(
          announceTrainingsJobConfig.expression,
          announceTrainingsJobConfig.job.bind(announceTrainingsJobConfig.job, this)
        )
      }

      const premiumMembersReportJobConfig = cronConfig.premiumMembersReportJob
      cron.schedule(
        premiumMembersReportJobConfig.expression,
        premiumMembersReportJobConfig.job.bind(premiumMembersReportJobConfig.job, this)
      )
    }

    public override get logsChannel (): TextChannel | null {
      return this.logsChannelId !== null
        ? (this.channels.cache.get(this.logsChannelId) as TextChannel | undefined) ?? null
        : null
    }

    public override get ratingsChannel (): TextChannel | null {
      return this.ratingsChannelId !== null
        ? (this.channels.cache.get(this.ratingsChannelId) as TextChannel | undefined) ?? null
        : null
    }

    public override get suggestionsChannel (): TextChannel | null {
      return this.suggestionsChannelId !== null
        ? (this.channels.cache.get(this.suggestionsChannelId) as TextChannel | undefined) ?? null
        : null
    }

    public override get ticketArchivesChannel (): TextChannel | null {
      return this.ticketArchivesChannelId !== null
        ? (this.channels.cache.get(this.ticketArchivesChannelId) as TextChannel | undefined) ?? null
        : null
    }

    public override get ticketsCategory (): CategoryChannel | null {
      return this.ticketsCategoryId !== null
        ? (this.channels.cache.get(this.ticketsCategoryId) as CategoryChannel | undefined) ?? null
        : null
    }

    // @ts-expect-error
    public override async handleRoleMessage (
      type: 'add' | 'remove',
      reaction: MessageReaction,
      user: User
    ): Promise<void> {
      const member = await this.members.fetch(user)
      for (const roleMessage of this.roleMessages.cache.values()) {
        if (reaction.message.id === roleMessage.messageId && (reaction.emoji instanceof GuildEmoji
          ? roleMessage.emoji instanceof GuildEmoji && reaction.emoji.id === roleMessage.emojiId
          : !(roleMessage.emoji instanceof GuildEmoji) && reaction.emoji.name === roleMessage.emojiId)) {
          await member.roles[type](roleMessage.roleId)
        }
      }
    }

    // @ts-expect-error
    public override async log (
      author: User,
      content: string,
      options: { color?: ColorResolvable, footer?: string } = {}
    ): Promise<Message | null> {
      if (this.logsChannel !== null) {
        if (author.partial) {
          await author.fetch()
        }

        const embed = new MessageEmbed()
          .setAuthor(author.tag, author.displayAvatarURL())
          .setColor(this.primaryColor ?? 0xffffff)
          .setDescription(content)
        if (typeof options.color !== 'undefined') {
          embed.setColor(options.color)
        }
        if (typeof options.footer !== 'undefined') {
          embed.setFooter(options.footer)
        }

        return await this.logsChannel.send(embed)
      }
      return null
    }

    // @ts-expect-error
    public override async update (data: Partial<GuildEntity>): Promise<this> {
      const [, [newData]] = await GuildModel.update({
        commandPrefix: data.commandPrefix,
        logsChannelId: data.logsChannelId,
        primaryColor: data.primaryColor,
        ratingsChannelId: data.ratingsChannelId,
        robloxGroupId: data.robloxGroupId,
        robloxUsernamesInNicknames: data.robloxUsernamesInNicknames,
        suggestionsChannelId: data.suggestionsChannelId,
        supportEnabled: data.supportEnabled,
        ticketArchivesChannelId: data.ticketArchivesChannelId,
        ticketsCategoryId: data.ticketsCategoryId,
        verificationPreference: data.verificationPreference?.toLowerCase()
      }, {
        where: { id: this.id },
        returning: true
      })

      this.setup(newData)
      return this
    }
  }
))

export default AroraGuild

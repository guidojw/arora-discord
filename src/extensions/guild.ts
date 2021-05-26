import {
  CategoryChannel,
  Client,
  Guild,
  GuildEmoji,
  MessageEmbed,
  MessageReaction,
  Structures,
  TextChannel,
  User
} from 'discord.js'
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
import { Guild as GuildModel } from '../models'
import { VerificationProvider } from '../util/constants'
import applicationConfig from '../configs/application'
import cron from 'node-cron'
import cronConfig from '../configs/cron'

declare module 'discord.js' {
  export interface Guild {
    groups: GuildGroupManager
    panels: GuildPanelManager
    roleBindings: GuildRoleBindingManager
    roleMessages: GuildRoleMessageManager
    tags: GuildTagManager
    tickets: GuildTicketManager
    ticketTypes: GuildTicketTypeManager

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
  }
}

// @ts-expect-error
const AroraGuild: Guild = Structures.extend('Guild', Guild => {
  class AroraGuild extends Guild {
    constructor (client: Client, data: object) {
      super(client, data)

      this.groups = new GuildGroupManager(this)
      this.panels = new GuildPanelManager(this)
      this.roleBindings = new GuildRoleBindingManager(this)
      this.roleMessages = new GuildRoleMessageManager(this)
      this.tags = new GuildTagManager(this)
      this.tickets = new GuildTicketManager(this)
      this.ticketTypes = new GuildTicketTypeManager(this)

      this.members = new GuildMemberManager(this)
    }

    _setup (data: {
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
    }): void {
      this.logsChannelId = data.logsChannelId
      this.primaryColor = data.primaryColor
      this.ratingsChannelId = data.ratingsChannelId
      this.robloxGroupId = data.robloxGroupId
      this.robloxUsernamesInNicknames = data.robloxUsernamesInNicknames
      this.suggestionsChannelId = data.suggestionsChannelId
      this.supportEnabled = data.supportEnabled
      this.ticketArchivesChannelId = data.ticketArchivesChannelId
      this.ticketsCategoryId = data.ticketsCategoryId
      this.trainingsInfoPanelId = data.trainingsInfoPanelId
      this.trainingsPanelId = data.trainingsPanelId

      if (data.channels) {
        for (const rawChannel of data.channels) {
          const channel = this.channels.cache.get(rawChannel.id)
          if (channel && channel._setup) {
            channel._setup(rawChannel)
          }
        }
      }

      if (data.groups) {
        for (const rawGroup of data.groups) {
          this.groups.add(rawGroup)
        }
      }

      if (data.panels) {
        for (const rawPanel of data.panels) {
          this.panels.add(rawPanel)
        }
      }

      if (data.roles) {
        for (const rawRole of data.roles) {
          const role = this.roles.cache.get(rawRole.id)
          if (typeof role !== 'undefined') {
            role._setup(rawRole)
          }
        }
      }

      if (data.roleMessages) {
        for (const rawRoleMessage of data.roleMessages) {
          this.roleMessages.add(rawRoleMessage)
        }
      }

      if (data.tags) {
        for (const rawTag of data.tags) {
          this.tags.add(rawTag)
        }
      }

      if (data.tickets) {
        for (const rawTicket of data.tickets) {
          this.tickets.add(rawTicket)
        }
      }

      if (data.ticketTypes) {
        for (const rawTicketType of data.ticketTypes) {
          this.ticketTypes.add(rawTicketType)
        }
      }

      this.verificationPreference = data.verificationPreference !== null
        ? VerificationProvider[data.verificationPreference.toUpperCase()]
        : null
    }

    _patch (data: any): void {
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

    async init (): Promise<void> {
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

    get logsChannel (): TextChannel | null {
      return this.channels.cache.get(this.logsChannelId) ?? null
    }

    get suggestionsChannel (): TextChannel | null {
      return this.channels.cache.get(this.suggestionsChannelId) ?? null
    }

    get ratingsChannel (): TextChannel | null {
      return this.channels.cache.get(this.ratingsChannelId) || null
    }

    get ticketArchivesChannel (): TextChannel | null {
      return this.channels.cache.get(this.ticketArchivesChannelId) || null
    }

    get ticketsCategory (): CategoryChannel | null {
      return this.channels.cache.get(this.ticketsCategoryId) || null
    }

    async handleRoleMessage (type: 'add' | 'remove', reaction: MessageReaction, user: User): Promise<void> {
      const member = await this.members.fetch(user)
      for (const roleMessage of this.roleMessages.cache.values()) {
        if (reaction.message.id === roleMessage.messageId && (reaction.emoji instanceof GuildEmoji
          ? roleMessage.emoji instanceof GuildEmoji && reaction.emoji.id === roleMessage.emojiId
          : !(roleMessage.emoji instanceof GuildEmoji) && reaction.emoji.name === roleMessage.emojiId)) {
          await member.roles[type](roleMessage.roleId)
        }
      }
    }

    async log (author, content, options = {}) {
      if (this.logsChannel) {
        if (author.partial) {
          await author.fetch()
        }

        const embed = new MessageEmbed()
          .setAuthor(author.tag, author.displayAvatarURL())
          .setColor(this.primaryColor)
          .setDescription(content)
        if (typeof options.color !== 'undefined') {
          embed.setColor(options.color)
        }
        if (options.footer) {
          embed.setFooter(options.footer)
        }

        return this.logsChannel.send(embed)
      }
    }

    async update (data) {
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
        trainingsInfoPanelId: data.trainingsInfoPanelId,
        trainingsPanelId: data.trainingsPanelId,
        verificationPreference: data.verificationPreference?.toLowerCase()
      }, {
        where: { id: this.id },
        returning: true
      })

      this._setup(newData)
      return this
    }
  }

  return AroraGuild
})

export default AroraGuild

'use strict'
const cron = require('node-cron')

const { MessageEmbed, Structures } = require('discord.js')
const {
  GuildGroupManager,
  GuildPanelManager,
  GuildRoleBindingManager,
  GuildRoleMessageManager,
  GuildTagManager,
  GuildTicketManager,
  GuildTicketTypeManager
} = require('../managers')
const { Guild: GuildModel } = require('../models')

const applicationConfig = require('../../config/application')
const cronConfig = require('../../config/cron')

const NSadminGuild = Structures.extend('Guild', Guild => {
  class NSadminGuild extends Guild {
    constructor (...args) {
      super(...args)

      this.groups = new GuildGroupManager(this)
      this.panels = new GuildPanelManager(this)
      this.roleBindings = new GuildRoleBindingManager(this)
      this.roleMessages = new GuildRoleMessageManager(this)
      this.tags = new GuildTagManager(this)
      this.tickets = new GuildTicketManager(this)
      this.ticketTypes = new GuildTicketTypeManager(this)
    }

    _setup (data) {
      this.id = data.id
      this.primaryColor = data.primaryColor
      this.supportEnabled = data.supportEnabled
      this.robloxGroupId = data.robloxGroupId
      this.logsChannelId = data.logsChannelId
      this.suggestionsChannelId = data.suggestionsChannelId
      this.ratingsChannelId = data.ratingsChannelId
      this.ticketsCategoryId = data.ticketsCategoryId
      this.trainingsPanelId = data.trainingsPanelId
      this.trainingsInfoPanelId = data.trainingsInfoPanelId

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
          if (role) {
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
    }

    async init () {
      if (applicationConfig.apiEnabled) {
        const announceTrainingsJob = cronConfig.announceTrainingsJob
        cron.schedule(
          announceTrainingsJob.expression,
          announceTrainingsJob.job.bind(announceTrainingsJob.job, this)
        )
      }

      const premiumMembersReportJob = cronConfig.premiumMembersReportJob
      cron.schedule(
        premiumMembersReportJob.expression,
        premiumMembersReportJob.job.bind(premiumMembersReportJob.job, this)
      )
    }

    get logsChannel () {
      return this.channels.cache.get(this.logsChannelId) || null
    }

    get suggestionsChannel () {
      return this.channels.cache.get(this.suggestionsChannelId) || null
    }

    get ratingsChannel () {
      return this.channels.cache.get(this.ratingsChannelId) || null
    }

    get ticketsCategory () {
      return this.channels.cache.get(this.ticketsCategoryId) || null
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
        primaryColor: data.primaryColor,
        commandPrefix: data.commandPrefix,
        supportEnabled: data.supportEnabled,
        robloxGroupId: data.robloxGroupId,
        logsChannelId: data.logsChannelId,
        suggestionsChannelId: data.suggestionsChannelId,
        ratingsChannelId: data.ratingsChannelId,
        ticketsCategoryId: data.ticketsCategoryId,
        trainingsPanelId: data.trainingsPanelId,
        trainingsInfoPanelId: data.trainingsInfoPanelId
      }, {
        where: { id: this.id },
        returning: true
      })

      this._setup(newData)
      return this
    }
  }

  return NSadminGuild
})

module.exports = NSadminGuild

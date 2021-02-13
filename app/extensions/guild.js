'use strict'
const cron = require('node-cron')

const { MessageEmbed, Structures } = require('discord.js')
const { GuildGroupManager } = require('../managers')
const { Guild: GuildModel } = require('../models')

const applicationConfig = require('../../config/application')
const cronConfig = require('../../config/cron')

const NSadminGuild = Structures.extend('Guild', Guild => {
  class NSadminGuild extends Guild {
    constructor (...args) {
      super(...args)

      this.groups = new GuildGroupManager(this)
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
          if (channel) {
            channel._setup(rawChannel)
          }
        }
      }

      if (data.groups) {
        for (const rawGroup of data.groups) {
          this.groups._add(rawGroup)
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
    }

    async init () {
      if (applicationConfig.apiEnabled) {
        const announceTrainingsJob = cronConfig.premiumMembersReportJob
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

    get trainingsChannel () {
      return this.channels.cache.get(this.trainingsChannelId) || null
    }

    get suggestionsChannel () {
      return this.channels.cache.get(this.suggestionsChannelId) || null
    }

    get ratingsChannel () {
      return this.channels.cache.get(this.ratingsChannelId) || null
    }

    get supportChannel () {
      return this.channels.cache.get(this.supportChannelId) || null
    }

    get welcomeChannel () {
      return this.channels.cache.get(this.welcomeChannelId) || null
    }

    get ticketsCategory () {
      return this.channels.cache.get(this.ticketsCategoryId) || null
    }

    async log (author, content, options) {
      if (this.logsChannel) {
        if (author.partial) {
          await author.fetch()
        }

        const embed = new MessageEmbed()
          .setAuthor(author.tag, author.displayAvatarURL())
          .setDescription(content)
          .setColor(this.primaryColor)
        if (options.footer) {
          embed.setFooter(options.footer)
        }
        if (options.color) {
          embed.setColor(options.color)
        }

        return this.logsChannel.send(embed)
      }
    }

    async update (data) {
      const newData = await GuildModel.update({
        primaryColor: data.primaryColor,
        commandPrefix: data.commandPrefix,
        supportEnabled: data.supportEnabled,
        robloxGroupId: data.robloxGroupId,
        logsChannelId: data.logsChannelId,
        trainingsChannelId: data.trainingsChannelId,
        suggestionsChannelId: data.suggestionsChannelId,
        ratingsChannelId: data.ratingsChannelId,
        supportChannelId: data.supportChannelId,
        welcomeChannelId: data.welcomeChannelId,
        ticketsCategoryId: data.ticketsCategoryId,
        trainingsMessageId: data.trainingsMessageId,
        trainingsInfoMessageId: data.trainingsInfoMessageId,
        supportMessageId: data.supportMessageId
      }, {
        where: {
          id: this.id
        }
      })

      this._setup(newData)
      return this
    }
  }

  return NSadminGuild
})

module.exports = NSadminGuild

'use strict'
const Collection = require('@discordjs/collection')
const cron = require('node-cron')

const { MessageEmbed, Structures } = require('discord.js')
const { Guild: GuildModel } = require('../models')
const { Group } = require('../structures')

const applicationConfig = require('../../config/application')
const cronConfig = require('../../config/cron')

const NSadminGuild = Structures.extend('Guild', Guild => {
  class NSadminGuild extends Guild {
    constructor (...args) {
      super(...args)

      this.groups = new Collection()
    }

    _setup (data) {
      this.id = data.id
      this.primaryColor = typeof data.primaryColor !== 'undefined' ? data.primaryColor : null // primaryColor can be 0
      this.supportEnabled = data.supportEnabled || null
      this.robloxGroupId = data.robloxGroupId || null
      this.logsChannelId = data.logsChannelId || null
      this.trainingsChannelId = data.trainingsChannelId || null
      this.suggestionsChannelId = data.suggestionsChannelId || null
      this.ratingsChannelId = data.ratingsChannelId || null
      this.supportChannelId = data.supportChannelId || null
      this.welcomeChannelId = data.welcomeChannelId || null
      this.ticketsCategoryId = data.ticketsCategoryId || null
      this.trainingsMessageId = data.trainingsMessageId || null
      this.trainingsInfoMessageId = data.trainingsInfoMessageId || null
      this.supportMessageId = data.supportMessageId || null

      if (data.groups) {
        for (const group of data.groups) {
          this.groups.set(group.id, new Group(this.client, group))
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
      const guild = await GuildModel.findByPk(this.id)

      const newData = await guild.update({
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
      })

      this._setup(newData)
      return newData
    }
  }

  return NSadminGuild
})

module.exports = NSadminGuild

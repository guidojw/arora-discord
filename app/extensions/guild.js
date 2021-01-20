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
      this.primaryColor = data.primaryColor
      this.supportEnabled = data.supportEnabled
      this.robloxGroupId = data.robloxGroupId
      this.logsChannelId = data.logsChannelId
      this.trainingsChannelId = data.trainingsChannelId
      this.suggestionsChannelId = data.suggestionsChannelId
      this.ratingsChannelId = data.ratingsChannelId
      this.supportChannelId = data.supportChannelId
      this.welcomeChannelId = data.welcomeChannelId
      this.ticketsCategoryId = data.ticketsCategoryId
      this.trainingsMessageId = data.trainingsMessageId
      this.trainingsInfoMessageId = data.trainingsInfoMessageId
      this.supportMessageId = data.supportMessageId

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

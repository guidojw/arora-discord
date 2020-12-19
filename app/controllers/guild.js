'use strict'
const cron = require('node-cron')

const { MessageEmbed } = require('discord.js')
const { Guild } = require('../models')


const applicationConfig = require('../../config/application')
const cronConfig = require('../../config/cron')

class GuildController {
  constructor (client, data) {
    this.client = client

    this.jobs = {}
    this.groupPermissions = {}
    this.rolePermissions = {}

    this._patch(data)
  }

  _patch (data) {
    this.id = data.id
    this.primaryColor = typeof data.primaryColor !== 'undefined' ? data.primaryColor : null // primaryColor can be 0
    this.commandPrefix = data.commandPrefix || null
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
  }

  async init () {
    // // Voting system jobs
    // const voteData = this.getData('vote')
    // if (voteData && voteData.timer && voteData.timer.end > Date.now()) {
    //   this.scheduleJob('saveVoteJob')
    //   this.scheduleJob('updateTimerJob')
    // }

    // Jobs depending on if API is enabled
    if (applicationConfig.apiEnabled) {
      this.scheduleJob('announceTrainingsJob')
    }

    // Other jobs
    this.scheduleJob('premiumMembersReportJob')
  }

  get guild () {
    return this.client.guilds.cache.get(this.id) || null
  }

  get logsChannel () {
    return this.logsChannelId ? this.guild.channels.cache.get(this.logsChannelId) : null
  }

  get trainingsChannel () {
    return this.trainingsChannelId ? this.guild.channels.cache.get(this.trainingsChannelId) : null
  }

  get suggestionsChannel () {
    return this.suggestionsChannelId ? this.guild.channels.cache.get(this.suggestionsChannelId) : null
  }

  get ratingsChannel () {
    return this.ratingsChannelId ? this.guild.channels.cache.get(this.ratingsChannelId) : null
  }

  get supportChannel () {
    return this.supportChannelId ? this.guild.channels.cache.get(this.supportChannelId) : null
  }

  get welcomeChannel () {
    return this.welcomeChannelId ? this.guild.channels.cache.get(this.welcomeChannelId) : null
  }

  get ticketsCategory () {
    return this.ticketsCategoryId ? this.guild.channels.cache.get(this.ticketsCategoryId) : null
  }

  scheduleJob (name) {
    if (this.jobs[name]) {
      throw new Error('A job with that name already exists.')
    }
    const job = cronConfig[name]
    this.jobs[name] = cron.schedule(job.expression, job.job.bind(job.job, this))
  }

  stopJob (name) {
    if (!this.jobs[name]) {
      throw new Error('No job with that name exists.')
    }
    this.jobs[name].stop()
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

  async edit (data) {
    const guild = await Guild.findByPk(this.id)

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

    this._patch(newData)
    return newData
  }
}

module.exports = GuildController

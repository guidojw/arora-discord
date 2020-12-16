'use strict'
const cron = require('node-cron')

const applicationConfig = require('../../config/application')
const cronConfig = require('../../config/cron')

class Guild {
  constructor (data, client) {
    this.id = data.id
    this.primaryColor = data.primaryColor
    this.commandPrefix = data.commandPrefix
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

    this.instance = data
    this.guild = client.guilds.cache.get(data.id)

    this.jobs = {}
    this.groupPermissions = {}
    this.rolePermissions = {}
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

  log (author, content, footer) {
    if (this.logsChannelId) {
      const embed = new MessageEmbed()
        .setAuthor(author.tag, author.displayAvatarURL())
        .setDescription(content)
        .setColor(this.primaryColor)
      if (footer) {
        embed.setFooter(footer)
      }

      return this.guild.channels.cache.get(this.logsChannelId).send(embed)
    }
  }

  async setData (key, value) {
    await this.instance.update({ [key]: value })
    this[key] = value
    return value
  }
}

module.exports = Guild

'use strict'
const Collection = require('@discordjs/collection')
const cron = require('node-cron')
const BaseStructure = require('./base')
const GroupController = require('./group')
const RoleController = require('./role')

const { MessageEmbed } = require('discord.js')
const { Guild } = require('../models')

const applicationConfig = require('../../config/application')
const cronConfig = require('../../config/cron')

class GuildController extends BaseStructure {
  constructor (client, data) {
    super(client)

    this.groups = new Collection()
    this.roles = new Collection()

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

    if (data.groups) {
      for (const group of data.groups) {
        this.groups.set(group.id, new GroupController(this.client, group))
      }
    }

    if (data.roles) {
      for (const role of data.roles) {
        this.roles.set(role.id, new RoleController(this.client, role))
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

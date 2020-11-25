'use strict'
const EventEmitter = require('events')
const pluralize = require('pluralize')
const short = require('short-uuid')
const discordService = require('../services/discord')
const roVerAdapter = require('../adapters/rover')
const timeHelper = require('../helpers/time')

const { MessageEmbed } = require('discord.js')
const { stripIndents } = require('common-tags')

const TicketState = {
  INIT: 'init',
  CREATING_CHANNEL: 'creatingChannel',
  CONNECTED: 'connected',
  RECONNECTED: 'reconnected',
  REQUESTING_RATING: 'requestingRating',
  CLOSING: 'closing'
}

const TicketType = {
  PERSON_REPORT: 'personReport',
  BUG_REPORT: 'bugReport',
  PRIZE_CLAIM: 'prizeClaim'
}

const SUBMISSION_TIME = 30 * 60 * 1000 // time after which a ticket with no messages will be closed

class TicketController extends EventEmitter {
  constructor (ticketsController, client, type, author) {
    super()

    this.ticketsController = ticketsController
    this.client = client
    this.guild = undefined // TODO: remove usages of Bot.mainGuild
    this.type = type

    if (author) {
      // If this is a new ticket.
      this.author = author
      this.moderators = []

      this.id = short.generate()
      this.state = TicketState.INIT

      this.init()
    } else {
      // If this is a reconnected ticket
      // being reinstantiated after reboot.
      this.state = TicketState.RECONNECTED
    }
  }

  async init () {
    await this.createChannel()

    // Populate the channel with the ticket creator's data.
    await this.populateChannel()

    // Initialise the submission timeout after which the ticket will
    // be closed if nothing was messaged.
    this.timeout = setTimeout(this.close.bind(this, 'Timeout: ticket closed'), SUBMISSION_TIME)

    await this.submit()
  }

  async createChannel () {
    this.state = TicketState.CREATING_CHANNEL

    const name = `${this.type}-${this.id}`
    const guild = this.client.bot.mainGuild
    this.channel = await guild.guild.channels.create(name)
    this.channel = await this.channel.setParent(guild.getData('channels').ticketsCategory)

    await this.channel.updateOverwrite(this.author, { VIEW_CHANNEL: true })
  }

  async populateChannel () {
    // Check if user is verified with RoVer
    // If so, the Roblox username and ID are retrieved.
    let username
    let userId
    try {
      const response = (await roVerAdapter('get', `/user/${this.author.id}`)).data
      username = response.robloxUsername
      userId = response.robloxId
    } catch (err) {
      if (err.response.status !== 404) {
        throw err
      }
    }

    const date = new Date()
    const readableDate = timeHelper.getDate(date)
    const readableTime = timeHelper.getTime(date)

    const embed = new MessageEmbed()
      .setColor(this.client.bot.mainGuild.getData('primaryColor'))
      .setTitle('Ticket Information')
      .setDescription(stripIndents`
      Username: ${username ? '**' + username + '**' : '*unknown (user is not verified with RoVer)*'}
      User ID: ${userId ? '**' + userId + '**' : '*unknown (user is not verified with RoVer)*'}
      Start time: ${readableDate + ' ' + readableTime}
      `)
      .setFooter(`Ticket ID: ${this.id} | ${this.type
        .split(/(?=[A-Z])/)
        .map(string => string.toLowerCase())
        .join(' ')
      }`)
    return this.channel.send(`${this.author}`, { embed })
  }

  async submit () {
    if (this.state === TicketState.CREATING_CHANNEL) {
      const embed = new MessageEmbed()
        .setColor(this.client.bot.mainGuild.getData('primaryColor'))
        .setDescription(stripIndents`
        A Ticket Moderator will be with you shortly.
        This may take up to 24 hours. You can still close your ticket by using the \`/closeticket\` command.
        `)
      await this.channel.send(embed)

      const guild = this.client.bot.getGuild(this.channel.guild.id)
      const roles = guild.getData('roles')
      await this.channel.updateOverwrite(roles.ticketModeratorRole, { VIEW_CHANNEL: true })

      this.client.bot.log(this.author, `${this.author} **opened ticket** \`${this.id}\` **in** ${this.channel}`, `Ticket ID: ${this.id}`)

      this.state = TicketState.CONNECTED
    }
  }

  async close (message, success, color) {
    if (this.channel) {
      await this.channel.delete()
    }

    // If this ticket isn't reconnected and thus hasn't lost its author.
    if (this.state !== TicketState.RECONNECTED) {
      this.state = TicketState.CLOSING

      const embed = new MessageEmbed()
        .setColor(color || success ? 0x00ff00 : 0xff0000)
        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
        .setTitle(message)
      await this.client.bot.send(this.author, embed)

      // Request for the ticket creator's rating if
      // the ticket was closed successfully.
      if (success) {
        const rating = await this.requestRating()

        if (rating) {
          this.logRating(rating)

          const embed = new MessageEmbed()
            .setColor(this.client.bot.mainGuild.getData('primaryColor'))
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('Rating submitted')
            .setDescription('Thank you!')
          this.client.bot.send(this.author, embed)
        } else {
          const embed = new MessageEmbed()
            .setColor(this.client.bot.mainGuild.getData('primaryColor'))
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('No rating submitted')
          this.client.bot.send(this.author, embed)
        }
      }
    }

    this.emit('close')
  }

  async requestRating () {
    this.state = TicketState.REQUESTING_RATING

    const embed = new MessageEmbed()
      .setColor(this.client.bot.mainGuild.getData('primaryColor'))
      .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
      .setTitle('How would you rate the support you got?')
    const message = await this.client.bot.send(this.author, embed)

    const options = []
    for (let i = 5; i >= 1; i--) {
      options.push(discordService.getEmojiFromNumber(i))
    }

    let rating = await discordService.prompt(this.author, this.author, message, options)
    rating = rating && rating.substring(0, 1)
    return rating
  }

  logRating (rating) {
    // Form a string of the moderator's names.
    let result = ''
    for (let i = 0; i < this.moderators.length; i++) {
      const moderator = this.moderators[i]
      result += `**${moderator.tag}**`
      if (i < this.moderators.length - 2) {
        result += ', '
      } else if (i === this.moderators.length - 2) {
        result += ' & '
      }
    }
    result = result || 'none'

    const channels = this.client.bot.mainGuild.getData('channels')
    const channel = this.client.bot.mainGuild.guild.channels.cache.get(channels.ratingsChannel)

    const embed = new MessageEmbed()
      .setColor(this.client.bot.mainGuild.getData('primaryColor'))
      .setAuthor(this.author.tag, this.author.displayAvatarURL())
      .setTitle('Ticket Rating')
      .setDescription(stripIndents`
      ${pluralize('Moderator', this.moderators.length)}: ${result}
      Rating: **${rating}**
      `)
      .setFooter(`Ticket ID: ${this.id}`)
    return channel.send(embed)
  }

  static getTypeFromName (name) {
    for (const [type, typeName] of Object.entries(TicketType)) {
      if (typeName.toLowerCase() === name.toLowerCase()) {
        return type
      }
    }
  }
}

module.exports = {
  TicketController,
  TicketState,
  TicketType
}

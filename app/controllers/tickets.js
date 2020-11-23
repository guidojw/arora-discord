'use strict'
const discordService = require('../services/discord')

const { MessageEmbed } = require('discord.js')
const { TicketController, TicketState, TicketType } = require('./ticket')

const TICKETS_INTERVAL = 60000

module.exports = class TicketsController {
  constructor (client) {
    this.client = client

    this.tickets = {} // map from ticket ID to TicketController
    this.debounces = {} // map from user ID to debounce flag

    this.init()
  }

  async init () {
    const guild = this.client.bot.mainGuild
    const channels = guild.getData('channels')
    const category = guild.guild.channels.cache.get(channels.ticketsCategory)

    for (const channel of category.children.values()) {
      if (channel.id === channels.ratingsChannel || channel.id === channels.supportChannel) {
        continue
      }

      // Get the ticket's id and type from the channel name (dataloss-id).
      const parts = channel.name.split('-')
      const type = TicketController.getTypeFromName(parts[0])
      const id = parts[1]

      const ticketController = new TicketController(this, this.client, type)
      ticketController.id = id
      ticketController.channel = channel
      this.tickets[id] = ticketController
      ticketController.once('close', this.clearTicket.bind(this, ticketController))
    }

    // Connect the message event for adding messages and moderators
    // to open TicketControllers.
    this.client.on('message', this.message.bind(this))

    // Connect the messageReactionAdd event for making new tickets.
    this.client.on('messageReactionAdd', this.messageReactionAdd.bind(this))
  }

  async messageReactionAdd (reaction, user) {
    if (user.bot) {
      return
    }
    const message = reaction.message
    if (message.partial) {
      await message.fetch()
    }
    if (!message.guild) {
      return
    }

    const guild = await this.client.bot.getGuild(message.guild.id)
    const messages = guild.getData('messages')
    if (message.id !== messages.supportMessage) {
      return
    }

    const type = reaction.emoji.name === discordService.getEmojiFromNumber(1)
      ? TicketType.PERSON_REPORT
      : reaction.emoji.name === discordService.getEmojiFromNumber(2)
        ? TicketType.BUG_REPORT
        : reaction.emoji.name === discordService.getEmojiFromNumber(3)
          ? TicketType.PRIZE_CLAIM
          : undefined
    if (type) {
      if (user.partial) {
        await user.fetch()
      }
      await reaction.users.remove(user)

      if (!this.debounces[user.id]) {
        // Set a timeout of 60 seconds in which the bot
        // will not react to message reactions.
        this.debounces[user.id] = true
        const timeout = setTimeout(this.clearAuthor.bind(this, user), TICKETS_INTERVAL)

        let ticketController = this.getTicketFromAuthor(user)
        if (!ticketController) {
          if (!this.client.bot.mainGuild.getData('settings').supportEnabled) {
            const embed = new MessageEmbed()
              .setColor(0xff0000)
              .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
              .setTitle('Welcome to NS Roblox Support')
              .setDescription('We are currently closed. Check the Twin-Rail server for more information.')
            return this.client.bot.send(user, embed)
          }

          const member = guild.guild.member(user)
          const roles = guild.getData('roles')
          if (member.roles.cache.has(roles.ticketsBannedRole)) {
            const embed = new MessageEmbed()
              .setColor(0xff0000)
              .setTitle('Couldn\'t make ticket')
              .setDescription('You\'re banned from making new tickets.')
            return this.client.bot.send(user, embed)
          }

          this.clearAuthor(user)
          clearTimeout(timeout)

          ticketController = new TicketController(this, this.client, type, user)
          this.tickets[ticketController.id] = ticketController
          ticketController.once('close', this.clearTicket.bind(this, ticketController))
        } else {
          const embed = new MessageEmbed()
            .setColor(0xff0000)
            .setTitle('Couldn\'t make ticket')
            .setDescription('You already have an open ticket.')
          return this.client.bot.send(user, embed)
        }
      }
    }
  }

  async message (message) {
    if (message.author.bot) {
      return
    }
    if (message.partial) {
      await message.fetch()
    }
    if (!message.guild) {
      return
    }
    if (message.content.startsWith(this.client.commandPrefix)) {
      return
    }

    const guild = this.client.bot.getGuild(message.guild.id)
    const channels = guild.getData('channels')
    if (message.channel.parentID !== channels.ticketsCategory) {
      return
    }

    const ticketController = this.getTicketFromChannel(message.channel)
    if (ticketController) {
      // If this ticket is reconnected and thus has lost its author,
      // don't update.
      if (ticketController.state === TicketState.RECONNECTED) {
        return
      }

      if (ticketController.timeout) {
        clearTimeout(ticketController.timeout)
        ticketController.timeout = undefined
      }

      if (message.author.id !== ticketController.author.id) {
        if (!ticketController.moderators.includes(message.author)) {
          ticketController.moderators.push(message.author)
        }
      }
    }
  }

  clearTicket (ticketController) {
    if (ticketController) {
      // If the TicketController hasn't lost its author.
      if (ticketController.state !== TicketState.RECONNECTED) {
        this.clearAuthor(ticketController.author)
      }

      delete this.tickets[ticketController.id]
    }
  }

  clearAuthor (author) {
    delete this.debounces[author.id]
  }

  getTicketFromChannel (channel) {
    return Object.values(this.tickets).find(ticketController => {
      return ticketController.channel.id === channel.id
    })
  }

  getTicketFromAuthor (author) {
    return Object.values(this.tickets).find(ticketController => {
      return ticketController.state !== TicketState.RECONNECTED && ticketController.author.id === author.id
    })
  }
}

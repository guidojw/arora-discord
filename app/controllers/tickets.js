'use strict'
const discordService = require('../services/discord')

const { MessageEmbed } = require('discord.js')
const { TicketController, TicketType } = require('./ticket')
const { Ticket } = require('../models')

const TICKETS_INTERVAL = 60000

class TicketsController {
  constructor (client) {
    this.client = client

    this.tickets = {}
    this.timeouts = {}
  }

  async init () {
    for (const guild of Object.values(this.client.bot.guilds)) {
      this.tickets[guild.id] = {}
      this.timeouts[guild.id] = {}

      const tickets = await Ticket.findAll({ where: { guildId: guild.id } })
      for (const ticket of tickets) {
        if (!ticket.channelId || !guild.guild.channels.cache.has(ticket.channelId)) {
          await ticket.destroy()
        } else {
          const ticketController = new TicketController(this.client, ticket)
          this.tickets[guild.id][ticket.id] = ticketController
          ticketController.once('close', this.clearTicket.bind(this, guild, ticketController))
        }
      }
    }

    this.client.on('message', this.message.bind(this))
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
    if (message.id !== guild.supportMessageId) {
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

      if (!this.timeouts[guild.id][user.id]) {
        this.timeouts[guild.id][user.id] = setTimeout(this.clearTimeout.bind(this, guild, user.id), TICKETS_INTERVAL)

        let ticketController = this.getTicketFromAuthor(guild, user)
        if (!ticketController) {
          if (!guild.supportEnabled) {
            const embed = new MessageEmbed()
              .setColor(0xff0000)
              .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
              .setTitle(`Welcome to ${guild.guild.name} Support`)
              .setDescription(`We are currently closed. Check the ${guild.guild.name} server for more information.`)
            return this.client.bot.send(user, embed)
          }

          // const member = await guild.guild.members.fetch(user)
          // const roles = guild.getData('roles')
          // if (member.roles.cache.has(roles.ticketsBannedRole)) {
          //   const embed = new MessageEmbed()
          //     .setColor(0xff0000)
          //     .setTitle('Couldn\'t make ticket')
          //     .setDescription('You\'re banned from making new tickets.')
          //   return this.client.bot.send(user, embed)
          // }

          this.clearTimeout(guild, user.id)

          const data = await Ticket.create({
            authorId: user.id,
            guildId: message.guild.id,
            type
          })
          ticketController = new TicketController(this.client, data, guild)
          this.tickets[guild.id][ticketController.id] = ticketController
          ticketController.once('close', this.clearTicket.bind(this, guild, ticketController))
          ticketController.start()
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
    const ticketController = this.getTicketFromChannel(guild, message.channel)
    if (ticketController) {
      return ticketController.message(message)
    }
  }

  clearTicket (guild, ticketController) {
    delete this.tickets[guild.id][ticketController.id]
  }

  clearTimeout (guild, key) {
    delete this.timeouts[guild.id][key]
  }

  getTicketFromChannel (guild, channel) {
    return Object.values(this.tickets[guild.id]).find(ticketController => {
      return ticketController.channelId === channel.id
    })
  }

  getTicketFromAuthor (guild, author) {
    return Object.values(this.tickets[guild.id]).find(ticketController => {
      return ticketController.authorId === author.id
    })
  }
}

module.exports = TicketsController

'use strict'
const Collection = require('@discordjs/collection')
const discordService = require('../services/discord')
const TicketController = require('../structures/ticket')

const { MessageEmbed } = require('discord.js')
const { Ticket } = require('../models')

const ticketTypes = {
  PERSON_REPORT: 'personReport',
  BUG_REPORT: 'bugReport',
  PRIZE_CLAIM: 'prizeClaim'
}

const TICKETS_INTERVAL = 60000

class TicketsController {
  constructor (client) {
    this.client = client

    this.tickets = new Collection()
    this.timeouts = new Collection()
  }

  async init () {
    for (const guild of this.client.bot.guilds.values()) {
      this.tickets.set(guild.id, new Collection())
      this.timeouts.set(guild.id, new Collection())

      const tickets = await Ticket.findAll({ where: { guildId: guild.id } })
      for (const ticket of tickets) {
        if (!ticket.channelId || !guild.channels.cache.has(ticket.channelId)) {
          await ticket.destroy()
        } else {
          const ticketController = new TicketController(this.client, ticket)
          this.tickets.get(guild.id).set(ticket.id, ticketController)
          ticketController.once('close', this.clearTicket.bind(this, guild, ticketController))
        }
      }
    }

    this.client.on('message', this.message.bind(this))
    this.client.on('messageReactionAdd', this.messageReactionAdd.bind(this))

    this.client.bot.on('ticketClose', this.ticketClose.bind(this))
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

    const guild = await this.client.bot.guilds.get(message.guild.id)
    if (message.id !== guild.supportMessageId) {
      return
    }

    const type = reaction.emoji.name === discordService.getEmojiFromNumber(1)
      ? ticketTypes.PERSON_REPORT
      : reaction.emoji.name === discordService.getEmojiFromNumber(2)
        ? ticketTypes.BUG_REPORT
        : reaction.emoji.name === discordService.getEmojiFromNumber(3)
          ? ticketTypes.PRIZE_CLAIM
          : undefined
    if (type) {
      if (user.partial) {
        await user.fetch()
      }
      await reaction.users.remove(user)

      const timeouts = this.timeouts.get(guild.id)
      if (!timeouts.get(user.id)) {
        timeouts.set(user.id, setTimeout(this.clearTimeout.bind(this, guild, user.id), TICKETS_INTERVAL))

        let ticketController = this.getTicketFromAuthor(guild, user)
        if (!ticketController) {
          if (!guild.supportEnabled) {
            const embed = new MessageEmbed()
              .setColor(0xff0000)
              .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
              .setTitle(`Welcome to ${guild.name} Support`)
              .setDescription(`We are currently closed. Check the ${guild.name} server for more information.`)
            return this.client.bot.send(user, embed)
          }

          // const member = await guild.members.fetch(user)
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
          this.tickets.get(guild.id).set(ticketController.id, ticketController)
          return ticketController.start()
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

    const guild = this.client.bot.guilds.get(message.guild.id)
    const ticketController = this.getTicketFromChannel(guild, message.channel)
    if (ticketController) {
      return ticketController.message(message)
    }
  }

  ticketClose (ticketController) {
    return this.clearTicket(ticketController.guild, ticketController)
  }

  clearTicket (guild, ticketController) {
    return this.tickets.get(guild.id).delete(ticketController.id)
  }

  clearTimeout (guild, key) {
    return this.timeouts.get(guild.id).delete(key)
  }

  getTicketFromChannel (guild, channel) {
    return this.tickets.get(guild.id).find(ticketController => {
      return ticketController.channelId === channel.id
    })
  }

  getTicketFromAuthor (guild, author) {
    return this.tickets.get(guild.id).find(ticketController => {
      return ticketController.authorId === author.id
    })
  }
}

module.exports = TicketsController

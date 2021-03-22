'use strict'
const BaseManager = require('./base')

const { GuildEmoji, MessageEmbed, TextChannel } = require('discord.js')
const { Ticket: TicketModel } = require('../models')
const { Ticket } = require('../structures')

const TICKETS_INTERVAL = 60 * 1000
const SUBMISSION_TIME = 30 * 60 * 1000

class GuildTicketManager extends BaseManager {
  constructor (guild, iterable) {
    super(guild.client, iterable, Ticket)

    this.guild = guild

    this.debounces = new Map()
  }

  add (data, cache = true) {
    return super.add(data, cache, { extras: [this.guild] })
  }

  async create ({ author, type }) {
    author = this.guild.members.resolve(author)
    if (!author) {
      throw new Error('Invalid author.')
    }
    type = this.guild.ticketTypes.resolve(type)
    if (!type) {
      throw new Error('Invalid ticket type.')
    }

    const channelName = `${type.name}-${author.user.tag}`
    const channel = await this.guild.channels.create(channelName, { parent: this.guild.ticketsCategory })
    await channel.updateOverwrite(author, { VIEW_CHANNEL: true })

    const newData = await TicketModel.create({
      authorId: author.id,
      guildId: this.guild.id,
      channelId: channel.id,
      typeId: type.id
    })
    await newData.reload()
    const ticket = this.add(newData)

    this.guild.log(
      this.author,
      `${ticket.author} **opened ticket** \`${ticket.id}\` **in** ${ticket.channel}`,
      { footer: `Ticket ID: ${ticket.id}` }
    )

    return ticket
  }

  async delete (ticket) {
    const id = this.resolveID(ticket)
    if (!id) {
      throw new Error('Invalid ticket.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Ticket not found.')
    }

    await TicketModel.destroy({ where: { id } })
    this.cache.delete(id)
  }

  async update (ticket, data) {
    const id = this.resolveID(ticket)
    if (!id) {
      throw new Error('Invalid ticket.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Ticket not found.')
    }

    const changes = {}
    if (typeof data.channel !== 'undefined') {
      const channel = this.guild.channels.resolve(data.channel)
      if (!channel || !(channel instanceof TextChannel)) {
        throw new Error('Invalid channel.')
      }
      changes.channelId = channel.id
    }

    const [, [newData]] = await TicketModel.update(changes, {
      where: { id },
      returning: true
    })

    const _ticket = this.cache.get(id)
    _ticket?._setup(newData)
    return _ticket ?? this.add(newData, false)
  }

  async onMessageReactionAdd (reaction, user) {
    const type = this.guild.ticketTypes.cache.find(type => {
      return type.message?.id === reaction.message.id && type.emoji && (reaction.emoji instanceof GuildEmoji
        ? type.emoji instanceof GuildEmoji && reaction.emoji.id === type.emojiId
        : !(type.emoji instanceof GuildEmoji) && reaction.emoji.name === type.emojiId)
    })
    if (type) {
      await reaction.users.remove(user)

      if (!this.debounces.has(user.id)) {
        this.debounces.set(user.id, true)
        this.client.setTimeout(this.debounces.delete.bind(this.debounces, user.id), TICKETS_INTERVAL)

        if (!this.resolve(user)) {
          if (!this.guild.supportEnabled) {
            const embed = new MessageEmbed()
              .setColor(0xff0000)
              .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
              .setTitle(`Welcome to ${this.guild.name} Support`)
              .setDescription(`We are currently closed. Check the ${this.guild.name} server for more information.`)
            return this.client.send(user, embed)
          }

          const ticket = await this.create({ author: user, type })
          ticket.populateChannel()
          ticket.timeout = this.client.setTimeout(ticket.close.bind(ticket, 'Timeout: ticket closed'), SUBMISSION_TIME)
        } else {
          const embed = new MessageEmbed()
            .setColor(0xff0000)
            .setTitle('Couldn\'t make ticket')
            .setDescription('You already have an open ticket.')
          return this.client.send(user, embed)
        }
      }
    }
  }

  resolve (ticket) {
    const ticketResolvable = super.resolve(ticket)
    if (ticketResolvable) {
      return ticketResolvable
    }
    const memberResolvable = this.guild.members.resolve(ticket)
    if (memberResolvable) {
      return this.cache.find(ticket => ticket.authorId === memberResolvable.id) || null
    }
    const channelResolvable = this.guild.channels.resolve(ticket)
    if (channelResolvable) {
      return this.cache.find(ticket => ticket.channelId === channelResolvable.id) || null
    }
    return null
  }

  resolveID (ticket) {
    const ticketResolvable = super.resolve(ticket)
    if (ticketResolvable) {
      return ticketResolvable.id
    }
    const memberResolvable = this.guild.members.resolve(ticket)
    if (memberResolvable) {
      return this.cache.find(ticket => ticket.authorId === memberResolvable.id)?.id ?? null
    }
    const channelResolvable = this.guild.channels.resolve(ticket)
    if (channelResolvable) {
      return this.cache.find(ticket => ticket.channelId === channelResolvable.id)?.id ?? null
    }
    return null
  }
}

module.exports = GuildTicketManager

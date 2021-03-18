'use strict'
const BaseManager = require('./base')

const { GuildEmoji } = require('discord.js')
const { TicketType: TicketTypeModel } = require('../models')
const { TicketType } = require('../structures')

class GuildTicketTypeManager extends BaseManager {
  constructor (guild, iterable) {
    super(guild.client, iterable, TicketType)

    this.guild = guild
  }

  add (data, cache = true) {
    return super.add(data, cache, { extras: [this.guild] })
  }

  async create (name) {
    name = name.toLowerCase()
    if (this.resolve(name)) {
      throw new Error('A ticket type with that name already exists.')
    }

    const newData = await TicketTypeModel.create({ guildId: this.guild.id, name })

    return this.add(newData)
  }

  async delete (ticketType) {
    ticketType = this.resolve(ticketType)
    if (!ticketType) {
      throw new Error('Invalid ticket type.')
    }
    if (!this.cache.has(ticketType.id)) {
      throw new Error('Ticket type not found.')
    }

    if (ticketType.emoji && ticketType.panel?.message) {
      if (ticketType.panel.message.partial) {
        await ticketType.panel.message.fetch()
      }
      await ticketType.panel.message.reactions.resolve(ticketType.emoji.id || ticketType.emoji)?.users
        .remove(this.client.user)
    }

    await TicketTypeModel.destroy({ where: { id: ticketType.id } })
    this.cache.delete(ticketType.id)
  }

  async update (ticketType, data) {
    const id = this.resolveID(ticketType)
    if (!id) {
      throw new Error('Invalid ticket type.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Ticket type not found.')
    }

    const changes = {}
    if (typeof data.name !== 'undefined') {
      if (this.resolve(data.name)) {
        throw new Error('A ticket type with that name already exists.')
      }
      changes.name = data.name.toLowerCase()
    }

    const [, [newData]] = await TicketTypeModel.update(changes, {
      where: { id },
      returning: true
    })

    const _ticketType = this.cache.get(id)
    _ticketType?._setup(newData)
    return _ticketType ?? this.add(newData, false)
  }

  async bind (ticketType, panel, emoji) {
    ticketType = this.resolve(ticketType)
    if (!ticketType) {
      throw new Error('Invalid ticket type.')
    }
    if (!this.cache.has(ticketType.id)) {
      throw new Error('Ticket type not found.')
    }
    if ((typeof panel === 'undefined') !== (typeof emoji === 'undefined')) {
      throw new Error('Either both panel and emoji have to be specified or none.')
    }
    if (typeof panel !== 'undefined') {
      panel = this.guild.panels.resolve(panel)
      if (!panel) {
        throw new Error('Invalid panel.')
      }
      if (!panel.message) {
        throw new Error('Can only bind ticket types to posted panels.')
      }
    }
    if (typeof emoji !== 'undefined') {
      if (emoji instanceof GuildEmoji) {
        emoji = this.guild.emojis.resolve(emoji)
      } else {
        const valid = this.client.registry.types.get('default-emoji').validate(emoji, null, {})
        emoji = !valid || typeof valid === 'string' ? null : emoji
      }
      if (!emoji) {
        throw new Error('Invalid emoji.')
      }
    }

    const data = {
      panelId: panel?.id ?? null,
      emojiId: null,
      emoji: null
    }
    if (ticketType.emoji && ticketType.panel?.message) {
      if (ticketType.panel.message.partial) {
        await ticketType.panel.message.fetch()
      }
      await ticketType.panel.message.reactions.resolve(ticketType.emoji.id || ticketType.emoji)?.users
        .remove(this.client.user)
    }
    if (typeof emoji !== 'undefined') {
      if (emoji instanceof GuildEmoji) {
        data.emojiId = emoji.id
      } else {
        data.emoji = emoji
      }
      if (panel.message.partial) {
        await panel.message.fetch()
      }
      await panel.message.react(emoji)
    }
    const [, [newData]] = await TicketTypeModel.update(data, {
      where: { id: ticketType.id },
      returning: true,
      individualHooks: true
    })

    const _ticketType = this.cache.get(ticketType.id)
    _ticketType?._setup(newData)
    return _ticketType ?? this.add(newData, false)
  }

  resolve (ticketType) {
    if (typeof ticketType === 'string') {
      ticketType = ticketType.toLowerCase().replace(/\s/g, '')
      return this.cache.find(otherTicketType => {
        return otherTicketType.name.toLowerCase().replace(/\s/g, '') === ticketType
      }) || null
    }
    return super.resolve(ticketType)
  }

  resolveID (ticketType) {
    if (typeof ticketType === 'string') {
      ticketType = ticketType.toLowerCase().replace(/\s/g, '')
      return this.cache.find(otherTicketType => {
        return otherTicketType.name.toLowerCase().replace(/\s/g, '') === ticketType
      })?.id ?? null
    }
    return super.resolveID(ticketType)
  }
}

module.exports = GuildTicketTypeManager

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

  async delete (type) {
    type = this.resolve(type)
    if (!type) {
      throw new Error('Invalid ticket type.')
    }
    if (!this.cache.has(type.id)) {
      throw new Error('Ticket type not found.')
    }

    if (type.emoji && type.message) {
      if (type.message.partial) {
        await type.message.fetch()
      }
      await type.message.reactions.resolve(type.emojiId)?.users.remove(this.client.user)
    }

    await TicketTypeModel.destroy({ where: { id: type.id } })
    this.cache.delete(type.id)
  }

  async update (type, data) {
    const id = this.resolveID(type)
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

    const _type = this.cache.get(id)
    _type?._setup(newData)
    return _type ?? this.add(newData, false)
  }

  async link (type, emoji, message, channel) {
    type = this.resolve(type)
    if (!type) {
      throw new Error('Invalid ticket type.')
    }
    if (!this.cache.has(type.id)) {
      throw new Error('Ticket type not found.')
    }
    channel = this.guild.channels.resolve(channel)
    if (!channel) {
      throw new Error('Invalid channel.')
    }
    message = channel.messages.resolve(message) ?? message
    try {
      if (message.partial) {
        message = await message.fetch()
      } else if (typeof message === 'string') {
        message = await channel.messages.fetch(message)
      }
    } catch {
      throw new Error('Invalid message.')
    }
    if (emoji instanceof GuildEmoji) {
      emoji = this.guild.emojis.resolve(emoji)
    } else {
      const valid = this.client.registry.types.get('default-emoji').validate(emoji, null, {})
      emoji = !valid || typeof valid === 'string' ? null : emoji
    }
    if (!emoji) {
      throw new Error('Invalid emoji.')
    }

    if (type.emoji && type.message) {
      if (type.message.partial) {
        await type.message.fetch()
      }
      await type.message.reactions.resolve(type.emojiId)?.users.remove(this.client.user)
    }
    await message.react(emoji)
    const [, [newData]] = await TicketTypeModel.update({
      messageId: message.id,
      emojiId: emoji instanceof GuildEmoji ? emoji.id : null,
      emoji: !(emoji instanceof GuildEmoji) ? emoji : null
    }, {
      where: { id: type.id },
      channelId: channel.id,
      returning: true,
      individualHooks: true
    })
    await newData.reload()

    const _type = this.cache.get(type.id)
    _type?._setup(newData)
    return _type ?? this.add(newData, false)
  }

  async unlink (type) {
    type = this.resolve(type)
    if (!type) {
      throw new Error('Invalid ticket type.')
    }
    if (!this.cache.has(type.id)) {
      throw new Error('Ticket type not found.')
    }

    if (type.emoji && type.message) {
      if (type.message.partial) {
        await type.message.fetch()
      }
      await type.message.reactions.resolve(type.emojiId)?.users.remove(this.client.user)
    }
    const [, [newData]] = await TicketTypeModel.update({
      messageId: null,
      emojiId: null,
      emoji: null
    }, {
      where: { id: type.id },
      returning: true,
      individualHooks: true
    })

    const _type = this.cache.get(type.id)
    _type?._setup(newData)
    return _type ?? this.add(newData, false)
  }

  resolve (type) {
    if (typeof type === 'string') {
      type = type.toLowerCase().replace(/\s/g, '')
      return this.cache.find(otherType => (
        otherType.name.toLowerCase().replace(/\s/g, '') === type
      )) || null
    }
    return super.resolve(type)
  }

  resolveID (type) {
    if (typeof type === 'string') {
      type = type.toLowerCase().replace(/\s/g, '')
      return this.cache.find(otherType => (
        otherType.name.toLowerCase().replace(/\s/g, '') === type
      ))?.id ?? null
    }
    return super.resolveID(type)
  }
}

module.exports = GuildTicketTypeManager

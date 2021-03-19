'use strict'
const BaseManager = require('./base')

const { GuildEmoji } = require('discord.js')
const { RoleMessage: RoleMessageModel } = require('../models')
const { RoleMessage } = require('../structures')

class GuildRoleMessageManager extends BaseManager {
  constructor (guild, iterable) {
    super(guild.client, iterable, RoleMessage)

    this.guild = guild
  }

  add (data, cache = true) {
    return super.add(data, cache, { extras: [this.guild] })
  }

  async create ({ role, channel, message, emoji }) {
    role = this.guild.roles.resolve(role)
    if (!role) {
      throw new Error('Invalid role.')
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
    if (this.cache.some(roleMessage => {
      return roleMessage.roleId === role.id && roleMessage.messageId === message.id && (emoji instanceof GuildEmoji
        ? roleMessage.emoji instanceof GuildEmoji && emoji.id === roleMessage.emojiId
        : !(roleMessage.emoji instanceof GuildEmoji) && emoji.name === roleMessage.emojiId)
    })) {
      throw new Error('A role message with that role, message and emoji already exists.')
    }

    await message.react(emoji)
    const newData = await RoleMessageModel.create({
      roleId: role.id,
      messageId: message.id,
      emojiId: emoji instanceof GuildEmoji ? emoji.id : null,
      emoji: !(emoji instanceof GuildEmoji) ? emoji : null,
      guildId: this.guild.id
    }, {
      channelId: channel.id
    })
    await newData.reload()

    return this.add(newData)
  }

  async delete (roleMessage) {
    roleMessage = this.resolve(roleMessage)
    if (!roleMessage) {
      throw new Error('Invalid role message.')
    }
    if (!this.cache.has(roleMessage.id)) {
      throw new Error('Role message not found.')
    }

    if (roleMessage.emoji && roleMessage.message) {
      if (roleMessage.message.partial) {
        await roleMessage.message.fetch()
      }
      await roleMessage.message.reactions.resolve(roleMessage.emojiId)?.users.remove(this.client.user)
    }

    await RoleMessageModel.destroy({ where: { id: roleMessage.id } })
    this.cache.delete(roleMessage.id)
  }
}

module.exports = GuildRoleMessageManager

'use strict'
const Collection = require('@discordjs/collection')

const { TextChannel } = require('discord.js')
const { Channel, Group } = require('../models')

class GroupTextChannelManager {
  constructor (group) {
    this.group = group
    this.guild = group.guild

    this._channels = new Collection()
  }

  get cache () {
    return this.guild.channels.cache.filter(channel => this._channels.has(channel.id))
  }

  _add (data) {
    const existing = this.cache.get(data.id)
    if (existing) {
      return existing
    }

    const channel = this.guild.channels.cache.get(data.id)
    this._channels.set(channel.id, channel)
    return channel
  }

  async add (channel) {
    channel = this.guild.channels.resolve(channel)
    if (!channel || !(channel instanceof TextChannel)) {
      throw new Error('Invalid channel.')
    }
    if (this._channels.has(channel.id)) {
      throw new Error('Group already contains channel.')
    }

    const [data] = await Channel.findOrCreate({
      where: {
        id: channel.id,
        guildId: this.guild.id
      }
    })
    await data.addGroup(this.group.id)
    this._channels.set(channel.id, channel)

    return channel
  }

  async remove (channel) {
    const id = this.guild.channels.resolveID(channel)
    if (!id) {
      throw new Error('Invalid channel.')
    }
    if (!this._channels.has(id)) {
      throw new Error('Group does not contain channel.')
    }

    const group = await Group.findByPk(this.group.id)
    await group.removeChannel(id)
    this._channels.delete(id)

    if (channel instanceof TextChannel) {
      return channel
    }
    const _channel = this.guild.channels.cache.get(id)
    if (_channel) {
      return _channel
    }
    return id
  }
}

module.exports = GroupTextChannelManager

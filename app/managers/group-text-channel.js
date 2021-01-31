'use strict'
const Collection = require('@discordjs/collection')

const { Channel, ChannelGroup } = require('../models')

class GroupTextChannelManager {
  constructor (group) {
    this.group = group
    this.guild = group.guild

    this._channels = new Collection()
  }

  get cache () {
    return this.guild.channels.filter(channel => this._channels.has(channel.id))
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

    await Channel.findOrCreate({
      where: {
        id: channel.id,
        guildId: this.guild.id
      }
    })
    await ChannelGroup.create({
      channelId: channel.id,
      groupId: this.group.id
    })
    this._channels.set(channel.id, channel)

    return this.channel
  }
}

module.exports = GroupTextChannelManager

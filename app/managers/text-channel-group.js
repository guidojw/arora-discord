'use strict'
const { Channel, ChannelGroup } = require('../models')

class TextChannelGroupManager {
  constructor (channel) {
    this.channel = channel
    this.guild = channel.guild
  }

  get cache () {
    return this.guild.groups.filter(group => group instanceof ChannelGroup && group.channels.cache.has(this.channel.id))
  }

  async add (group) {
    group = this.guild.groups.resolve(group)

    await Channel.findOrCreate({
      where: {
        id: this.role.id,
        guildId: this.guild.id
      }
    })
    await ChannelGroup.create({
      channelId: this.channel.id,
      groupId: group.id
    })

    return this.channel
  }
}

module.exports = TextChannelGroupManager

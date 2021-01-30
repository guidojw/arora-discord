'use strict'
const { Channel, ChannelGroup } = require('../models')

class GuildChannelGroupManager {
  constructor (channel) {
    this.channel = channel
    this.guild = channel.guild
  }

  get _roles () {
    return this.guild.groups.filter(group => this.channel._groups.includes(group.id))
  }

  get cache () {
    return this._roles
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
      channelId: this.channelId.id,
      groupId: group.id
    })

    return this.channel
  }
}

module.exports = GuildChannelGroupManager

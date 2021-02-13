'use strict'
class TextChannelGroupManager {
  constructor (channel) {
    this.channel = channel
    this.guild = channel.guild
  }

  get cache () {
    return this.guild.groups.filter(group => group.type === 'channel' && group.channels.cache.has(this.channel.id))
  }
}

module.exports = TextChannelGroupManager

'use strict'
const Group = require('./group')

const { GroupGuildChannelManager } = require('../managers')

class ChannelGroup extends Group {
  constructor (client, data, guild) {
    super(client, data, guild)

    this.channels = new GroupGuildChannelManager(this)
  }

  _setup (data) {
    super._setup(data)

    if (data.channels) {
      for (const rawChannel of data.channels) {
        this.channels._add(rawChannel)
      }
    }
  }
}

module.exports = ChannelGroup

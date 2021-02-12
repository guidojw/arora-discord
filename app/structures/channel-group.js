'use strict'
const Group = require('./group')
const GroupTextChannelManager = require('../managers/group-text-channel')

class ChannelGroup extends Group {
  constructor (client, data, guild) {
    super(client, data, guild)

    this.channels = new GroupTextChannelManager(this)

    this._setup(data)
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

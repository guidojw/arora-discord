'use strict'

const Group = require('./group')
const GroupTextChannelManager = require('../managers/group-text-channel')

class ChannelGroup extends Group {
  constructor (client, data, guild) {
    super(client, data, guild)

    this._channels = []

    this._setup(data)
  }

  _setup (data) {
    super._setup(data)

    if (data.channels) {
      this._channels = data.channels.map(channel => channel.id)
    }
  }

  get channels () {
    return new GroupTextChannelManager(this)
  }
}

module.exports = ChannelGroup

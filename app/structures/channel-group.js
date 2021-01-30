'use strict'
const Collection = require('@discordjs/collection')
const Group = require('./group')

class ChannelGroup extends Group {
  constructor (client, data, guild) {
    super(client, data, guild)

    this.channels = new Collection()
  }

  _setup (data) {
    super._setup(data)

    if (data.channels) {
      for (const channel of data.channels) {

      }
    }
  }
}

module.exports = ChannelGroup

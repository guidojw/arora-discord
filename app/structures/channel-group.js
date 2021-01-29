'use strict'
const Collection = require('@discordjs/collection')
const Group = require('./group')

class ChannelGroup extends Group {
  constructor (client, data) {
    super(client, data)

    this.channels = new Collection()
  }

  _patch (data) {
    super._patch(data)

    if (data.channels) {
      for (const channel of data.channels) {

      }
    }
  }
}

module.exports = ChannelGroup

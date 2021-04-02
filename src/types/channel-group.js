'use strict'

const BaseArgumentType = require('./base')

const { ChannelGroup } = require('../structures')

class ChannelGroupArgumentType extends BaseArgumentType {
  constructor (client) {
    super(client, ChannelGroup, 'groups')
  }
}

module.exports = ChannelGroupArgumentType

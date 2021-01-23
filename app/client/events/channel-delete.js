'use strict'
const BaseEvent = require('./base')

const { Channel } = require('../../models')

class ChannelDeleteEvent extends BaseEvent {
  handle (channel) {
    return Channel.destroy({ where: { id: channel.id } })
  }
}

module.exports = ChannelDeleteEvent

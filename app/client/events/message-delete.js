'use strict'
const BaseEvent = require('./base')

const { Message } = require('../../models')

class MessageDeleteEvent extends BaseEvent {
  handle (message) {
    return Message.destroy({ where: { id: message.id } })
  }
}

module.exports = MessageDeleteEvent

'use strict'
const BaseEvent = require('./base')

class MessageReactionRemoveEvent extends BaseEvent {
  handle (reaction, user) {
    return this.handleRoleMessage('remove', reaction, user)
  }
}

module.exports = MessageReactionRemoveEvent

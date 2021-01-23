'use strict'
const BaseEvent = require('./base')

class MessageReactionAddEvent extends BaseEvent {
  handle (reaction, user) {
    return this.handleRoleMessage('add', reaction, user)
  }
}

module.exports = MessageReactionAddEvent

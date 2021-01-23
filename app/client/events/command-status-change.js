'use strict'
const BaseEvent = require('./base')

class CommandStatusChangeEvent extends BaseEvent {
  handle (guild, command, enabled) {
    return this.client.provider.commandStatusChange('command', guild, command, enabled)
  }
}

module.exports = CommandStatusChangeEvent

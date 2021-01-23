'use strict'
const BaseEvent = require('./base')

class CommandPrefixChangeEvent extends BaseEvent {
   handle (guild, prefix) {
     return this.client.provider.commandPrefixChange(guild, prefix)
  }
}

module.exports = CommandPrefixChangeEvent

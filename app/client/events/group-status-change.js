'use strict'
const BaseEvent = require('./base')

class GroupStatusChangeEvent extends BaseEvent {
  async handle (guild, command, enabled) {
    return this.client.provider.commandStatusChange('group', guild, command, enabled)
  }
}

module.exports = GroupStatusChangeEvent

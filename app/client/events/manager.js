'use strict'
const lodash = require('lodash')

class EventManager {
  constructor (client) {
    this.client = client

    this.register(require('./channel-delete'))
    this.register(require('./command-error'))
    this.register(require('./command-run'))
    this.register(require('./emoji-delete'))
    this.register(require('./guild-create'))
    this.register(require('./guild-member-add'))
    this.register(require('./message'))
    this.register(require('./message-delete'))
    this.register(require('./message-reaction-add'))
    this.register(require('./message-reaction-remove'))
    this.register(require('./role-delete'))
  }

  register(Event) {
    this[lodash.camelCase(Event.name.replace(/Event$/, ''))] = new Event(this.client);
  }
}

module.exports = EventManager

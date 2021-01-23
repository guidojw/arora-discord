'use strict'
const BaseEvent = require('./base')

class GuildCreateEvent extends BaseEvent {
  handle (guild) {
    return this.provider.setupGuild(guild.id)
  }
}

module.exports = GuildCreateEvent

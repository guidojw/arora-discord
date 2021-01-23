'use strict'
const BaseEvent = require('./base')

const { Guild } = require('../../models')

class GuildCreateEvent extends BaseEvent {
  async handle (guild) {
    const data = await Guild.create({ id: guild.id })
    await data.reload() // Load all included models.
    return this.provider.setupGuild(guild, data)
  }
}

module.exports = GuildCreateEvent

'use strict'

const guildCreateHandler = (client, guild) => {
  client.provider.setupGuild(guild.id)
}

module.exports = guildCreateHandler

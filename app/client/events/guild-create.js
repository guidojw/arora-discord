'use strict'
const guildCreateHandler = (client, guild) => {
  return client.provider.setupGuild(guild.id)
}

module.exports = guildCreateHandler

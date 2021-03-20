'use strict'
const commandPrefixChangeHandler = (client, guild, prefix) => {
  client.provider.commandPrefixChange(guild, prefix)
}

module.exports = commandPrefixChangeHandler

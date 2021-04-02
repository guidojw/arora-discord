'use strict'

const commandPrefixChangeHandler = (client, guild, prefix) => {
  client.provider.onCommandPrefixChange(guild, prefix)
}

module.exports = commandPrefixChangeHandler

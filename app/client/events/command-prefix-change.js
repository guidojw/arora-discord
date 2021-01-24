'use strict'
const commandPrefixChangeHandler = (client, guild, prefix) => {
  return client.provider.commandPrefixChange(guild, prefix)
}

module.exports = commandPrefixChangeHandler()

'use strict'
const commandStatusChangeHandler = (client, guild, command, enabled) => {
  client.provider.commandStatusChange('command', guild, command, enabled)
}

module.exports = commandStatusChangeHandler

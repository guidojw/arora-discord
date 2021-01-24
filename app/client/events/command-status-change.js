'use strict'
const commandStatusChangeHandler = (client, guild, command, enabled) => {
  return client.provider.commandStatusChange('command', guild, command, enabled)
}

module.exports = commandStatusChangeHandler()

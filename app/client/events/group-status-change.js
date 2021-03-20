'use strict'
const groupStatusChangeHandler = (client, guild, command, enabled) => {
  client.provider.commandStatusChange('group', guild, command, enabled)
}

module.exports = groupStatusChangeHandler

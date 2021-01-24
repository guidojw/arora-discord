'use strict'
const groupStatusChangeHandler = async (client, guild, command, enabled) => {
  return client.provider.commandStatusChange('group', guild, command, enabled)
}

module.exports = groupStatusChangeHandler

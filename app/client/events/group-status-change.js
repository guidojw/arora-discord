'use strict'

const groupStatusChangeHandler = (client, guild, command, enabled) => {
  client.provider.onCommandStatusChange('group', guild, command, enabled)
}

module.exports = groupStatusChangeHandler

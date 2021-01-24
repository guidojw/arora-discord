'use strict'
const messageReactionAddHandler = (client, reaction, user) => {
  return client.handleRoleMessage('add', reaction, user)
}

module.exports = messageReactionAddHandler

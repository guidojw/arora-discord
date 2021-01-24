'use strict'
const messageReactionRemoveHandler = (client, reaction, user) => {
  return client.handleRoleMessage('remove', reaction, user)
}

module.exports = messageReactionRemoveHandler

'use strict'
const messageReactionRemoveHandler = async (client, reaction, user) => {
  if (user.bot) {
    return
  }
  if (reaction.message.partial) {
    await reaction.message.fetch()
  }
  if (!reaction.message.guild) {
    return
  }

  client.handleRoleMessage('remove', reaction, user)
}

module.exports = messageReactionRemoveHandler

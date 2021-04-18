'use strict'

const messageReactionRemoveHandler = async (_client, reaction, user) => {
  if (user.bot) {
    return
  }
  if (reaction.message.partial) {
    await reaction.message.fetch()
  }
  if (!reaction.message.guild) {
    return
  }

  reaction.message.guild.handleRoleMessage('remove', reaction, user)
}

module.exports = messageReactionRemoveHandler

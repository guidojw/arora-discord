'use strict'

const messageReactionAddHandler = async (_client, reaction, user) => {
  if (user.bot) {
    return
  }
  if (reaction.message.partial) {
    await reaction.message.fetch()
  }
  if (!reaction.message.guild) {
    return
  }

  reaction.message.guild.handleRoleMessage('add', reaction, user)
  reaction.message.guild.tickets.onMessageReactionAdd(reaction, user)
}

module.exports = messageReactionAddHandler

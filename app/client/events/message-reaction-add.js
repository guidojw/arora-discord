'use strict'
const messageReactionAddHandler = async (client, reaction, user) => {
  if (user.bot) {
    return
  }
  if (reaction.message.partial) {
    await reaction.message.fetch()
  }
  if (!reaction.message.guild) {
    return
  }

  return Promise.all([
    client.handleRoleMessage('add', reaction, user),
    reaction.message.guild.tickets.onMessageReactionAdd(reaction, user)
  ])
}

module.exports = messageReactionAddHandler

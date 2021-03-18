'use strict'
const messageHandler = (client, message) => {
  if (message.author.bot) {
    return
  }
  const guild = message.guild
  if (!message.guild) {
    return
  }

  if (message.content.startsWith(guild.commandPrefix)) {
    const tagCommand = client.registry.resolveCommand('tag')
    if (tagCommand.isEnabledIn(guild)) {
      const name = message.content.slice(guild.commandPrefix.length)
      const tag = guild.tags.resolve(name)

      if (tag) {
        return message.reply(tag.content, { allowedMentions: { users: [message.author.id] } })
      }
    }
  } else {
    return guild.tickets.resolve(message.channel)?.onMessage(message)
  }
}

module.exports = messageHandler

'use strict'
const messageHandler = (client, message) => {
  if (message.author.bot) {
    return
  }
  const guild = message.guild
  if (!guild) {
    return
  }

  if (message.content.startsWith(guild.commandPrefix)) {
    const tagCommand = client.registry.commands.find(command => command.name === 'tag')
    if (tagCommand.isEnabledIn(guild)) {
      const name = message.content.slice(guild.commandPrefix.length)
      const tag = guild.tags.resolve(name)

      if (tag) {
        message.reply(tag.content, { allowedMentions: { users: [message.author.id] } })
      }
    }
  } else {
    guild.tickets.resolve(message.channel)?.onMessage(message)
  }
}

module.exports = messageHandler

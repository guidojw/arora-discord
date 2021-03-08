'use strict'
const messageHandler = (client, message) => {
  if (message.author.bot) {
    return
  }
  if (!message.guild) {
    return
  }
  const guild = client.guilds.cache.get(message.guild.id)

  if (message.content.startsWith(guild.commandPrefix)) {
    const tagCommand = client.registry.commands.find(command => command.name === 'tag')
    if (tagCommand.isEnabledIn(message.guild)) {
      const args = message.content.slice(guild.commandPrefix.length).trim().split(/ +/)
      const tagName = args.shift().toLowerCase()
      if (tagName) {
        const tag = message.guild.tags.resolve(tagName)

        if (tag) {
          return message.reply(tag.content, { allowedMentions: { users: [message.author.id] } })
        }
      }
    }
  }
}

module.exports = messageHandler

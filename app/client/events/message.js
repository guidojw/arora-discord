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
    const tagCommand = client.registry.resolveCommand('tag')
    if (tagCommand.isEnabledIn(guild) && tagCommand.hasPermission(message) === true) {
      const name = message.content.slice(guild.commandPrefix.length)
      const tag = guild.tags.resolve(name)

      if (tag) {
        message.reply(tag.content, { allowedMentions: { users: [message.author.id] } })
      }
    }
  }

  const photoContestChannelsGroup = guild.groups.resolve('photoContestChannels')
  if (photoContestChannelsGroup?.channels.cache.some(channel => channel.id === message.channel.id)) {
    if (message.attachments.size > 0 || message.embeds > 0) {
      message.react('👍')
    }
  }

  guild.tickets.resolve(message.channel)?.onMessage(message)
}

module.exports = messageHandler

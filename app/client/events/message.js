'use strict'
const { stripIndents } = require('common-tags')
const { MessageEmbed } = require('discord.js')

const messageHandler = (client, message) => {
  if (message.author.bot) {
    return
  }
  const guild = message.guild
  if (!guild) {
    return
  }

  if (message.content.startsWith(guild.commandPrefix)) {
    const tagsCommand = client.registry.resolveCommand('tags')
    if (tagsCommand.isEnabledIn(guild) && tagsCommand.hasPermission(message) === true) {
      const name = message.content.slice(guild.commandPrefix.length)
      const tag = guild.tags.resolve(name)

      if (tag) {
        message.reply(tag.content, tag.content instanceof MessageEmbed
          ? undefined
          : { allowedMentions: { users: [message.author.id] } })
      }
    }
  }

  const photoContestChannelsGroup = guild.groups.resolve('photoContestChannels')
  if (photoContestChannelsGroup?.channels?.cache.has(message.channel.id)) {
    if (message.attachments.size > 0 || message.embeds.length > 0) {
      message.react('👍')
    }
  }

  const noTextChannelsGroup = guild.groups.resolve('noTextChannels')
  if (noTextChannelsGroup?.channels?.cache.has(message.channel.id)) {
    if (message.attachments.size === 0 && message.embeds.length === 0) {
      const canTalkInNoTextChannelsGroup = guild.groups.resolve('canTalkInNoTextChannels')
      if (!message.member.roles.cache.some(role => canTalkInNoTextChannelsGroup?.roles?.cache.has(role.id))) {
        message.delete()
        message.guild.log(
          message.author,
          stripIndents`
          **Message sent by ${message.author} deleted in ${message.channel}**
          ${message.content}
          `,
          { color: null }
        )
      }
    }
  }

  guild.tickets.resolve(message.channel)?.onMessage(message)
}

module.exports = messageHandler

'use strict'

const { ArgumentType } = require('discord.js-commando')

const messageUrlRegex = /^https:\/\/discord.com\/channels\/([0-9]+|@me)\/[0-9]+\/[0-9]+$/
const endpointUrl = 'https://discord.com/channels/'

class MessageArgumentType extends ArgumentType {
  constructor (client) {
    super(client, 'message')
  }

  async validate (val, msg) {
    const match = val.match(messageUrlRegex)
    if (match) {
      const [guildId, channelId, messageId] = match[0]
        .replace(endpointUrl, '')
        .split('/')
      const channel = guildId === msg.guild.id
        ? msg.guild.channels.cache.get(channelId)
        : guildId === '@me'
          ? msg.channel
          : null
      if (!channel) {
        return false
      }
      try {
        return Boolean(await channel.messages?.fetch(messageId))
      } catch {
        return false
      }
    }
    return false
  }

  parse (val, msg) {
    const match = val.match(messageUrlRegex)
    const [, channelId, messageId] = match[0]
      .replace(endpointUrl, '')
      .split('/')
    const channel = msg.guild ? msg.guild.channels.cache.get(channelId) : msg.channel
    return channel.messages?.cache.get(messageId)
  }
}

module.exports = MessageArgumentType

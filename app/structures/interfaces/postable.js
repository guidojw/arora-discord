'use strict'
const { PartialTypes } = require('discord.js').Constants

class Postable {
  constructor (client, data, guild) {
    this.client = client
    this.guild = guild

    this.messageId = data.message.id
    this.channelId = data.message.channelId
  }

  get channel () {
    return this.guild.channels.cache.get(this.channelId) || null
  }

  get message () {
    return this.messageId !== null
      ? this.channel?.messages.cache.get(this.messageId) ||
      (this.client.options.partials.includes(PartialTypes.MESSAGE)
        ? this.channel?.messages.add({ id: this.messageId })
        : null)
      : null
  }

  static applyToClass (structure) {
    const props = ['channel', 'message']
    for (const prop of props) {
      Object.defineProperty(
        structure.prototype,
        prop,
        Object.getOwnPropertyDescriptor(Postable.prototype, prop)
      )
    }
  }
}

module.exports = Postable

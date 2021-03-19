'use strict'
const BaseStructure = require('./base')

const { Constants, MessageEmbed } = require('discord.js')
const { PartialTypes } = Constants

class Panel extends BaseStructure {
  constructor (client, data, guild) {
    super(client)

    this.guild = guild

    this._setup(data)
  }

  _setup (data) {
    this.id = data.id
    this.name = data.name
    this.content = data.content
    this.messageId = data.message?.id || null
    this.channelId = data.message?.channelId || null
  }

  get embed () {
    return new MessageEmbed(JSON.parse(this.content))
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

  update (data) {
    return this.guild.panels.update(this, data)
  }

  delete () {
    return this.guild.panels.delete(this)
  }

  post (channel) {
    return this.guild.panels.post(this, channel)
  }
}

module.exports = Panel

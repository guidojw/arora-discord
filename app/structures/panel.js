'use strict'
const BaseStructure = require('./base')

const { MessageEmbed } = require('discord.js')

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
    this.channelId = data.channelId
    this.messageId = data.messageId
  }

  get embed () {
    return new MessageEmbed(JSON.parse(this.content))
  }

  get channel () {
    return this.guild.channels.cache.get(this.channelId) || null
  }

  get message () {
    return this.channel?.messages.cache.get(this.messageId) ||
      (this.client.options.partials.includes('MESSAGE')
        ? this.channel?.messages.add({ id: this.messageId })
        : null)
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

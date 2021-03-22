'use strict'
const BaseStructure = require('./base')
const Postable = require('./interfaces/postable')

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
    this.messageId = data.message?.id || null
    this.channelId = data.message?.channelId || null
  }

  get embed () {
    return new MessageEmbed(JSON.parse(this.content))
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

Postable.applyToClass(Panel)

module.exports = Panel

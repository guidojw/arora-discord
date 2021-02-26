'use strict'
const BaseStructure = require('./base')

const { MessageEmbed } = require('discord.js')
const { Panel: PanelModel } = require('../models')

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
    return new MessageEmbed(this.content)
  }

  get channel () {
    return this.guild.channels.cache.get(this.channelId)
  }

  get message () {
    return this.channel.messages.cache.get(this.messageId) ||
      (this.client.options.partials.includes('MESSAGE')
        ? this.channel.messages.add({ id: this.messageId })
        : null)
  }

  async update (data) {
    const newData = await PanelModel.update({
      name: data.name,
      content: data.content,
      channelId: data.channelId,
      messageId: data.messageId
    }, {
      where: {
        id: this.id
      }
    })

    this._setup(newData)
    return this
  }

  async delete () {
    await PanelModel.destroy({ where: { id: this.id } })

    return this
  }

  async post (channel) {
    const message = await channel.send(this.embed)
    await this.update({
      channelId: channel.id,
      messageId: message.id
    })

    return message
  }
}

module.exports = Panel

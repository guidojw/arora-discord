'use strict'

const BaseStructure = require('./base')
const Postable = require('./interfaces/postable')

class TicketType extends BaseStructure {
  constructor (client, data, guild) {
    super(client)

    this.guild = guild

    this._setup(data)
  }

  _setup (data) {
    this.id = data.id
    this.name = data.name
    this._emoji = data.emoji
    this._emojiId = data.emojiId
    this.messageId = data.message?.id || null
    this.channelId = data.message?.channelId || null
  }

  get emoji () {
    return this.guild.emojis.cache.get(this._emojiId) || this._emoji
  }

  get emojiId () {
    return this._emoji || this._emojiId
  }

  update (data) {
    return this.guild.ticketTypes.update(this, data)
  }

  delete () {
    return this.guild.ticketTypes.delete(this)
  }

  bind (panel, emoji) {
    return this.guild.ticketTypes.bind(this, panel, emoji)
  }
}

Postable.applyToClass(TicketType)

module.exports = TicketType

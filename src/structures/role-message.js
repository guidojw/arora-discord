'use strict'

const BaseStructure = require('./base')
const Postable = require('./interfaces/postable')

class RoleMessage extends BaseStructure {
  constructor (client, data, guild) {
    super(client)

    this.guild = guild

    this._setup(data)
  }

  _setup (data) {
    this.id = data.id
    this.roleId = data.roleId
    this._emoji = data.emoji
    this._emojiId = data.emojiId
    this.messageId = data.message.id
    this.channelId = data.message.channelId
  }

  get emoji () {
    return this.guild.emojis.cache.get(this._emojiId) || this._emoji
  }

  get emojiId () {
    return this._emoji || this._emojiId
  }

  get role () {
    return this.guild.roles.cache.get(this.roleId)
  }

  delete () {
    return this.guild.roleMessages.delete(this)
  }
}

Postable.applyToClass(RoleMessage)

module.exports = RoleMessage

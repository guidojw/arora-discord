'use strict'
const Collection = require('@discordjs/collection')
const BaseStructure = require('./base')

class GroupController extends BaseStructure {
  constructor (client, data) {
    super(client)

    this.channels = []
    this.permissions = []

    this.roles = new Collection()

    this._patch(data)
  }

  _patch (data) {
    this.id = data.id
    this.name = data.name
    this.type = data.type
    this.guarded = data.guarded
    this.guildId = data.guildId

    if (data.channels) {
      for (const channel of data.channels) {
        this.channels.push(channel.channelId)
      }
    }

    if (data.permissions) {
      for (const { name, GroupPermission: { type } } of data.permissions) {
        this.permissions.push({ name, type })
      }
    }

    if (data.roles) {
      for (const role of data.roles) {
        this.roles.set(role.id, role)
      }
    }
  }
}

module.exports = GroupController

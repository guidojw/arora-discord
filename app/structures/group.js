'use strict'
const BaseStructure = require('./base')

const { ChannelGroup, RoleGroup } = require('../structures')
const { GroupTypes } = require('../util/constants')

class Group extends BaseStructure {
  constructor (client, data) {
    super(client)

    this._patch(data)
  }

  _patch (data) {
    this.id = data.id
    this.name = data.name
    this.guarded = data.guarded
    this.guildId = data.guildId
  }

  static create (client, data) {
    let group
    switch (data.type) {
      case GroupTypes.CHANNEL: {
        group = new ChannelGroup(this.client, data)
        break
      }
      case GroupTypes.ROLE: {
        group = new RoleGroup(this.client, data)
        break
      }
    }
    return group
  }
}

module.exports = Group

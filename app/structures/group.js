'use strict'
const BaseStructure = require('./base')

const { GroupTypes } = require('../util/constants')

class Group extends BaseStructure {
  constructor (client, data, guild) {
    super(client)

    this.type = data.type

    this.guild = guild
  }

  _setup (data) {
    this.id = data.id
    this.name = data.name
    this.guarded = data.guarded
  }

  update (data) {
    return this.guild.groups.update(this, data)
  }

  delete () {
    return this.guild.groups.delete(this)
  }

  static create (client, data, guild) {
    let group
    switch (data.type) {
      case GroupTypes.CHANNEL: {
        const ChannelGroup = require('./channel-group')
        group = new ChannelGroup(client, data, guild)
        break
      }
      case GroupTypes.ROLE: {
        const RoleGroup = require('./role-group')
        group = new RoleGroup(client, data, guild)
        break
      }
    }
    return group
  }
}

module.exports = Group

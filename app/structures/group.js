'use strict'
const BaseStructure = require('./base')

const { Group: GroupModel } = require('../models')
const { GroupTypes } = require('../util/constants')

class Group extends BaseStructure {
  constructor (client, data, guild) {
    super(client)

    this.guild = guild
  }

  _setup (data) {
    this.id = data.id
    this.name = data.name
    this.guarded = data.guarded
  }

  async update (data) {
    const newData = await GroupModel.update({
      name: data.name
    }, {
      where: {
        id: this.id
      }
    })

    this._setup(newData)
    return newData
  }

  delete () {
    this.guild.groups.cache.delete(this.id)
    return GroupModel.destroy({ where: { id: this.id } })
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

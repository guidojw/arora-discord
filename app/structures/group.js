'use strict'
const BaseStructure = require('./base')

const { Group: GroupModel } = require('../models')
const { ChannelGroup, RoleGroup } = require('../structures')
const { GroupTypes } = require('../util/constants')

class Group extends BaseStructure {
  constructor (client, data, guild) {
    super(client)

    this.guild = guild

    this._setup(data)
  }

  _setup (data) {
    this.id = data.id
    this.name = data.name
    this.guarded = data.guarded
    this.guildId = data.guildId
  }

  async update (data) {
    const group = await GroupModel.findByPk(this.id)

    const newData = await group.update({
      name: data.name
    })

    this._setup(newData)
    return newData
  }

  static create (client, data, guild) {
    let group
    switch (data.type) {
      case GroupTypes.CHANNEL: {
        group = new ChannelGroup(this.client, data, guild)
        break
      }
      case GroupTypes.ROLE: {
        group = new RoleGroup(this.client, data, guild)
        break
      }
    }
    return group
  }
}

module.exports = Group

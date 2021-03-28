'use strict'

const BaseStructure = require('./base')

class RoleBinding extends BaseStructure {
  constructor (client, data, guild) {
    super(client)

    this.guild = guild

    this._setup(data)
  }

  _setup (data) {
    this.id = data.id
    this.roleId = data.roleId
    this.robloxGroupId = data.robloxGroupId
    this.min = data.min
    this.max = data.max
  }

  get role () {
    return this.guild.roles.cache.get(this.roleId)
  }

  delete () {
    return this.guild.roleBindings.delete(this)
  }
}

module.exports = RoleBinding

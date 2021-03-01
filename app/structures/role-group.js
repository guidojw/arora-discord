'use strict'
const Group = require('./group')
const Permissible = require('./interfaces/permissible')
const GroupRoleManager = require('../managers/group-role')

class RoleGroup extends Group {
  constructor (client, data, guild) {
    super(client, data, guild)

    this.permissions = []

    this._roles = []

    this._setup(data)
  }

  _setup (data) {
    super._setup(data)

    if (data.permissions) {
      for (const { name } of data.permissions) {
        this.permissions.push(name)
      }
    }

    if (data.roles) {
      this._roles = data.roles.map(role => role.id)
    }
  }

  get roles () {
    return new GroupRoleManager(this)
  }
}

Permissible.applyToClass(RoleGroup)

module.exports = RoleGroup

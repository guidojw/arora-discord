'use strict'
const Group = require('./group')
const Permissible = require('./interfaces/permissible')
const GroupRoleManager = require('../managers/group-role')

class RoleGroup extends Group {
  constructor (client, data, guild) {
    super(client, data, guild)

    this.roles = new GroupRoleManager(this)

    this.permissions = []

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
      for (const rawRole of data.roles) {
        this.roles._add(rawRole)
      }
    }
  }
}

Permissible.applyToClass(RoleGroup)

module.exports = RoleGroup

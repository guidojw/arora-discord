'use strict'
const Permissible = require('./interfaces/permissible')
const Group = require('./group')

const { GroupGuildRoleManager } = require('../managers')

class RoleGroup extends Group {
  constructor (client, data, guild) {
    super(client, data, guild)

    this.roles = new GroupGuildRoleManager(this)

    this.permissions = []
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

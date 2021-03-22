'use strict'
const Group = require('./group')
const Permissible = require('./interfaces/permissible')
const GroupRoleManager = require('../managers/group-role')
const PermissionManager = require('../managers/permission')

class RoleGroup extends Group {
  constructor (client, data, guild) {
    super(client, data, guild)

    this.nsadminPermissions = new PermissionManager(this)

    this._roles = []

    this._setup(data)
  }

  _setup (data) {
    super._setup(data)

    if (data.permissions) {
      for (const rawPermission of data.permissions) {
        this.nsadminPermissions.add(rawPermission)
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

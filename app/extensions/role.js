'use strict'
const Permissible = require('../structures/interfaces/permissible')

const { Structures } = require('discord.js')
const { PermissionManager, RoleGroupManager } = require('../managers')

const NSadminRole = Structures.extend('Role', Role => {
  class NSadminRole extends Role {
    constructor (...args) {
      super(...args)

      this.nsadminPermissions = new PermissionManager(this)
    }

    _setup (data) {
      if (data.permissions) {
        for (const rawPermission of data.permissions) {
          this.nsadminPermissions.add(rawPermission)
        }
      }
    }

    get groups () {
      return new RoleGroupManager(this)
    }
  }

  Permissible.applyToClass(NSadminRole)

  return NSadminRole
})

module.exports = NSadminRole

'use strict'

const Permissible = require('../structures/interfaces/permissible')

const { Structures } = require('discord.js')
const { PermissionManager, RoleGroupManager } = require('../managers')

const AroraRole = Structures.extend('Role', Role => {
  class AroraRole extends Role {
    constructor (...args) {
      super(...args)

      this.aroraPermissions = new PermissionManager(this)
    }

    _setup (data) {
      if (data.permissions) {
        for (const rawPermission of data.permissions) {
          this.aroraPermissions.add(rawPermission)
        }
      }
    }

    get groups () {
      return new RoleGroupManager(this)
    }
  }

  Permissible.applyToClass(AroraRole)

  return AroraRole
})

module.exports = AroraRole

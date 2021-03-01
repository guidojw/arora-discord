'use strict'
const Permissible = require('../structures/interfaces/permissible')

const { Structures } = require('discord.js')
const { RoleGroupManager } = require('../managers')

const NSadminRole = Structures.extend('Role', Role => {
  class NSadminRole extends Role {
    constructor (...args) {
      super(...args)

      this.permissions = []
    }

    _setup (data) {
      if (data.permissions) {
        for (const { name } of data.permissions) {
          this.permissions.push(name)
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

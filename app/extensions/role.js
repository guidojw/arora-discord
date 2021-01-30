'use strict'
const Permissible = require('./interfaces/permissible')

const { Structures } = require('discord.js')
const { GuildRoleGroupManager } = require('../managers')

const NSadminRole = Structures.extend('Role', Role => {
  class NSadminRole extends Role {
    constructor (...args) {
      super(...args)

      this.groups = new GuildRoleGroupManager(this)

      this._groups = []
      this.permissions = []
    }

    _setup (data) {
      if (data.groups) {
        this._groups = data.groups.map(group => group.id)
      }

      if (data.permissions) {
        for (const { name } of data.permissions) {
          this.permissions.push(name)
        }
      }
    }
  }

  Permissible.applyToClass(NSadminRole)

  return NSadminRole
})

module.exports = NSadminRole

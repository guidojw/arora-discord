'use strict'
const { RoleGroup } = require('../structures')

class RoleGroupManager {
  constructor (role) {
    this.role = role
    this.guild = role.guild
  }

  get cache () {
    return this.guild.groups.filter(group => group instanceof RoleGroup && group.roles.cache.has(this.id))
  }
}

module.exports = RoleGroupManager

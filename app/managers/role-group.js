'use strict'

class RoleGroupManager {
  constructor (role) {
    this.role = role
    this.guild = role.guild
  }

  get cache () {
    return this.guild.groups.cache.filter(group => group.type === 'role' && group.roles.cache.has(this.role.id))
  }
}

module.exports = RoleGroupManager

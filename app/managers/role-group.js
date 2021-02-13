'use strict'
class RoleGroupManager {
  constructor (role) {
    this.role = role
    this.guild = role.guild
  }

  get cache () {
    return this.guild.groups.filter(group => group.type === 'role' && group.roles.cache.has(this.id))
  }
}

module.exports = RoleGroupManager
'use strict'
const { Role, RoleGroup } = require('../models')

class RoleGroupManager {
  constructor (role) {
    this.role = role
    this.guild = role.guild
  }

  get cache () {
    return this.guild.groups.filter(group => group instanceof RoleGroup && group.roles.cache.has(this.id))
  }

  async add (group) {
    group = this.guild.groups.resolve(group)

    await Role.findOrCreate({
      where: {
        id: this.role.id,
        guildId: this.guild.id
      }
    })
    await RoleGroup.create({
      roleId: this.role.id,
      groupId: group.id
    })

    return this.role
  }
}

module.exports = RoleGroupManager

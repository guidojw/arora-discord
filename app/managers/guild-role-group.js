'use strict'
const { Role, RoleGroup } = require('../models')

class GuildRoleGroupManager {
  constructor (role) {
    this.role = role
    this.guild = role.guild
  }

  get _roles () {
    return this.guild.groups.filter(group => this.channel._groups.includes(group.id))
  }

  get cache () {
    return this._roles
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

module.exports = GuildRoleGroupManager

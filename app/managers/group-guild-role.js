'use strict'
const Collection = require('@discordjs/collection')

const { Role, RoleGroup } = require('../models')

class GroupGuildRoleManager {
  constructor (group) {
    this.group = group
    this.guild = group.guild

    this._roles = new Collection()
  }

  get cache () {
    return this.guild.roles.filter(role => this._roles.has(role.id))
  }

  _add (data) {
    const existing = this.cache.get(data.id)
    if (existing) {
      return existing
    }

    const role = this.guild.roles.cache.get(data.id)
    this._roles.set(role.id, role)
    return role
  }

  async add (role) {
    role = this.guild.channels.resolve(role)

    await Role.findOrCreate({
      where: {
        id: role.id,
        guildId: this.guild.id
      }
    })
    await RoleGroup.create({
      roleId: role.id,
      groupId: this.group.id
    })
    this._roles.set(role.id, role)

    return this.channel
  }
}

module.exports = GroupGuildRoleManager

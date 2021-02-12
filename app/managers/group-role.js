'use strict'
const Collection = require('@discordjs/collection')

const { Role } = require('../models')

class GroupRoleManager {
  constructor (group) {
    this.group = group
    this.guild = group.guild

    this._roles = new Collection()
  }

  get cache () {
    return this.guild.roles.cache.filter(role => this._roles.has(role.id))
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
    role = this.guild.roles.resolve(role)

    const [data] = await Role.findOrCreate({
      where: {
        id: role.id,
        guildId: this.guild.id
      }
    })
    await data.addGroup(this.group.id)
    this._roles.set(role.id, role)

    return role
  }
}

module.exports = GroupRoleManager

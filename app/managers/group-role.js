'use strict'
const Collection = require('@discordjs/collection')

const { Role: DiscordRole } = require('discord.js')
const { Role, Group } = require('../models')

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
    if (!role) {
      throw new Error('Invalid role.')
    }
    if (this._roles.has(role.id)) {
      throw new Error('Group already contains role.')
    }

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

  async remove (role) {
    const id = this.guild.roles.resolveID(role)
    if (!id) {
      throw new Error('Invalid role.')
    }
    if (!this._roles.has(id)) {
      throw new Error('Group does not contain role.')
    }

    const group = await Group.findByPk(this.group.id)
    await group.removeRole(id)
    this._roles.delete(id)

    if (role instanceof DiscordRole) {
      return role
    }
    const _role = this.guild.roles.cache.get(id)
    if (_role) {
      return _role
    }
    return id
  }
}

module.exports = GroupRoleManager

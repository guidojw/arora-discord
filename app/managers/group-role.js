'use strict'
const { Role, Group } = require('../models')

class GroupRoleManager {
  constructor (group) {
    this.group = group
    this.guild = group.guild
  }

  get cache () {
    return this.guild.roles.cache.filter(role => this.group._roles.includes(role.id))
  }

  async add (role) {
    role = this.guild.roles.resolve(role)
    if (!role) {
      throw new Error('Invalid role.')
    }
    if (this.cache.has(role.id)) {
      throw new Error('Group already contains role.')
    }

    const [data] = await Role.findOrCreate({
      where: {
        id: role.id,
        guildId: this.guild.id
      }
    })
    await data.addGroup(this.group.id)
    this.group._roles.push(role.id)

    return this.group
  }

  async remove (role) {
    const id = this.guild.roles.resolveID(role)
    if (!id) {
      throw new Error('Invalid role.')
    }
    if (!this.group._roles.includes(id)) {
      throw new Error('Group does not contain role.')
    }

    const group = await Group.findByPk(this.group.id)
    await group.removeRole(id)
    this.group._roles = this.group._roles.filter(roleId => roleId !== id)

    return this.group
  }
}

module.exports = GroupRoleManager

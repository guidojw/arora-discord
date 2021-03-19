'use strict'
const BaseManager = require('./base')

const { RoleBinding: RoleBindingModel } = require('../models')
const { RoleBinding } = require('../structures')

class GuildRoleBindingManager extends BaseManager {
  constructor (guild, iterable) {
    super(guild.client, iterable, RoleBinding)

    this.guild = guild
  }

  add (data, cache = true) {
    return super.add(data, cache, { extras: [this.guild] })
  }

  async create ({ role, min, max }) {
    if (this.guild.robloxGroupId === null) {
      throw new Error('This server is not bound to a Roblox group yet.')
    }
    role = this.guild.roles.resolve(role)
    if (!role) {
      throw new Error('Invalid role.')
    }
    if (max !== null && max < min) {
      [min, max] = [max, min]
    }
    if (this.cache.some(roleBinding => {
      return roleBinding.roleId === role.id && roleBinding.min === min && roleBinding.max === max
    })) {
      throw new Error('A role message with that role and range already exists.')
    }

    const newData = await RoleBindingModel.create({
      robloxGroupId: this.guild.robloxGroupId,
      guildId: this.guild.id,
      roleId: role.id,
      min,
      max
    })

    return this.add(newData)
  }

  async delete (roleBinding) {
    const id = this.resolveID(roleBinding)
    if (!id) {
      throw new Error('Invalid role binding.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Role binding not found.')
    }

    await RoleBindingModel.destroy({ where: { id } })
    this.cache.delete(id)
  }
}

module.exports = GuildRoleBindingManager

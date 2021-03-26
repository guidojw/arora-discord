'use strict'
const BaseManager = require('./base')

const { Guild, RoleBinding: RoleBindingModel } = require('../models')
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
    await this.fetch()
    role = this.guild.roles.resolve(role)
    if (!role) {
      throw new Error('Invalid role.')
    }
    if (typeof max !== 'undefined' && max < min) {
      [min, max] = [max, min]
    }
    if (this.cache.some(roleBinding => (
      roleBinding.roleId === role.id && roleBinding.robloxGroupId === this.guild.robloxGroupId &&
      roleBinding.min === min && (typeof max === 'undefined' || roleBinding.max === max)
    ))) {
      throw new Error('A role binding for that role and range already exists.')
    }

    const newData = await RoleBindingModel.create({
      robloxGroupId: this.guild.robloxGroupId,
      guildId: this.guild.id,
      roleId: role.id,
      max: max ?? null,
      min
    })

    return this.add(newData)
  }

  async delete (roleBinding) {
    const id = this.resolveID(roleBinding)
    if (!id) {
      throw new Error('Invalid role binding.')
    }
    await this.fetch()
    if (!this.cache.has(id)) {
      throw new Error('Role binding not found.')
    }

    await RoleBindingModel.destroy({ where: { id } })
    this.cache.delete(id)
  }

  async fetch () {
    const data = await Guild.scope('withRoleBindings').findOne({ where: { id: this.guild.id } })
    this.cache.clear()
    for (const rawRoleBinding of data.roleBindings) {
      this.add(rawRoleBinding)
    }
    return this.cache
  }
}

module.exports = GuildRoleBindingManager

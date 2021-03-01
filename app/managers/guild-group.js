'use strict'
const { BaseManager } = require('discord.js')
const { Group: GroupModel } = require('../models')
const { Group } = require('../structures')
const { GroupTypes } = require('../util/constants')

class GuildGroupManager extends BaseManager {
  constructor (guild, iterable) {
    super(guild.client, iterable, Group)

    this.guild = guild
  }

  add (data) {
    const existing = this.cache.get(data.id)
    if (existing) {
      return existing
    }

    const group = Group.create(this.client, data, this.guild)
    this.cache.set(group.id, group)
    return group
  }

  async create ({ name, type }) {
    if (name.includes(' ')) {
      throw new Error('Name cannot include spaces.')
    }
    if (!Object.values(GroupTypes).includes(type)) {
      throw new Error('Invalid type.')
    }
    if (this.cache.some(group => group.name === name)) {
      throw new Error('A group with that name already exists.')
    }

    const group = await GroupModel.create({
      name,
      type: type.toLowerCase(),
      guildId: this.guild.id
    })

    return this.add(group)
  }

  async delete(group) {
    const id = this.resolveID(group)
    if (!id) {
      throw new Error('Invalid group.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Guild does not contain group.')
    }

    await GroupModel.destroy({ where: { id } })
    this.cache.delete(id)
  }
}

module.exports = GuildGroupManager

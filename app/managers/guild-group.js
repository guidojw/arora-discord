'use strict'
const BaseManager = require('./base')

const { Group: GroupModel } = require('../models')
const { Group } = require('../structures')

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

  async create (name, type) {
    type = type.toLowerCase()
    if (this.resolve(name)) {
      throw new Error('A group with that name already exists.')
    }

    const group = await GroupModel.create({
      guildId: this.guild.id,
      name,
      type
    })

    return this.add(group)
  }

  async delete (group) {
    group = this.resolve(group)
    if (!group) {
      throw new Error('Invalid group.')
    }
    if (!this.cache.has(group.id)) {
      throw new Error('Group not found.')
    }
    if (group.guarded) {
      throw new Error('Guarded groups cannot be deleted.')
    }

    await GroupModel.destroy({ where: { id: group.id } })
    this.cache.delete(group.id)
  }

  async update (group, data) {
    const id = this.resolveID(group)
    if (!id) {
      throw new Error('Invalid group.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Group not found.')
    }

    const changes = {}
    if (data.name) {
      if (this.resolve(data.name) !== null) {
        throw new Error('A group with that name already exists.')
      }
      changes.name = data.name
    }

    const [, [newData]] = await GroupModel.update(changes, {
      where: { id },
      returning: true
    })

    const _group = this.cache.get(id)
    _group?._setup(newData)
    return _group ?? this.add(newData, false)
  }

  resolve (group) {
    if (typeof group === 'string') {
      group = group.toLowerCase()
      return this.cache.find(otherGroup => otherGroup.name.toLowerCase() === group) || null
    }
    return super.resolve(group)
  }

  resolveID (group) {
    if (typeof group === 'string') {
      group = group.toLowerCase()
      return this.cache.find(otherGroup => otherGroup.name.toLowerCase() === group)?.id ?? null
    }
    return super.resolveID(group)
  }
}

module.exports = GuildGroupManager

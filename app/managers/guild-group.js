'use strict'
const BaseManager = require('./base')

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

  async create (name, type) {
    type = type.toLowerCase()
    if (name.includes(' ')) {
      throw new Error('Name cannot include spaces.')
    }
    if (!Object.values(GroupTypes).includes(type)) {
      throw new Error('Invalid type.')
    }
    const lowerCaseName = name.toLowerCase()
    if (this.cache.some(group => group.name.toLowerCase() === lowerCaseName)) {
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

    return group
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
      if (data.name.includes(' ')) {
        throw new Error('Name cannot include spaces.')
      }
      const lowerCaseName = data.name.toLowerCase()
      if (this.cache.some(group => group.name.toLowerCase() === lowerCaseName)) {
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

  resolve (idOrNameOrInstance) {
    if (typeof idOrNameOrInstance === 'string') {
      idOrNameOrInstance = idOrNameOrInstance.toLowerCase()
      return this.cache.find(group => group.name === idOrNameOrInstance) || null
    }
    return super.resolve(idOrNameOrInstance)
  }

  resolveID (idOrNameOrInstance) {
    if (typeof idOrNameOrInstance === 'string') {
      idOrNameOrInstance = idOrNameOrInstance.toLowerCase()
      return this.cache.find(group => group.name === idOrNameOrInstance)?.id ?? null
    }
    return super.resolveID(idOrNameOrInstance)
  }
}

module.exports = GuildGroupManager

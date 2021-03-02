'use strict'
const BaseManager = require('./base')

const { Tag } = require('../structures')

class GuildTagManager extends BaseManager {
  constructor (guild, iterable) {
    super(guild.client, iterable, Tag)

    this.guild = guild
  }

  add (data, cache = true) {
    return super.add(data, cache, { extras: [this.guild] })
  }

  async create (name, content) {

  }

  async delete (tag) {

  }

  async update (tag, data) {

  }

  resolve (idOrNameOrInstance) {
    if (typeof idOrNameOrInstance === 'string') {
      return this.cache.find(tag => tag.names.resolve(idOrNameOrInstance) !== null) || null
    }
    return super.resolve(idOrNameOrInstance)
  }

  resolveID (idOrNameOrInstance) {
    if (typeof idOrNameOrInstance === 'string') {
      return this.cache.find(tag => tag.names.resolve(idOrNameOrInstance) !== null)?.id ?? null
    }
    return super.resolveID(idOrNameOrInstance)
  }
}

module.exports = GuildTagManager

'use strict'
const BaseManager = require('./base')
const TagName = require('../structures/tag-name')

class TagTagNameManager extends BaseManager {
  constructor (tag, iterable) {
    super(tag.guild.client, iterable, TagName)

    this.tag = tag
  }

  add (data, cache = true) {
    return super.add(data, cache, { id: data.name })
  }

  async create (name, content) {

  }

  async delete (tagName) {

  }

  resolve (nameOrInstance) {
    if (typeof nameOrInstance === 'string') {
      nameOrInstance = nameOrInstance.toLowerCase()
      return this.cache.find(tagName => tagName.name.toLowerCase() === nameOrInstance) || null
    }
    return super.resolve(nameOrInstance)
  }

  resolveID (nameOrInstance) {
    if (nameOrInstance instanceof this.holds) {
      return nameOrInstance.name
    }
    if (typeof nameOrInstance === 'string') {
      nameOrInstance = nameOrInstance.toLowerCase()
      return this.cache.find(tagName => tagName.name.toLowerCase() === nameOrInstance)?.name ?? nameOrInstance
    }
    return null
  }
}

module.exports = TagTagNameManager

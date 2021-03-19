'use strict'
const BaseManager = require('./base')
const TagName = require('../structures/tag-name')

const { Tag, TagName: TagNameModel } = require('../models')

class TagTagNameManager extends BaseManager {
  constructor (tag, iterable) {
    super(tag.guild.client, iterable, TagName)

    this.tag = tag
    this.guild = tag.guild
  }

  add (data, cache = true) {
    return super.add(data, cache, { id: data.name })
  }

  async create (name) {
    name = name.toLowerCase()
    if (this.guild.tags.resolve(name) !== null) {
      throw new Error('A tag with that name already exists.')
    }
    if (name === 'all' ||
      this.client.registry.commands.some(command => command.name === name || command.aliases.includes(name))) {
      throw new Error('Not allowed, name is reserved.')
    }

    const data = await Tag.findByPk(this.tag.id)
    const newData = await data.createName({ name })

    return this.add(newData)
  }

  async delete (tagName) {
    const id = this.resolveID(tagName)
    if (!id) {
      throw new Error('Invalid name.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Name not found.')
    }
    if (this.cache.size - 1 === 0) {
      throw new Error('Can\'t delete name, the tag would have 0 names after.')
    }

    await TagNameModel.destroy({ where: { name: id, tagId: this.tag.id } })
    this.cache.delete(id)
  }

  resolve (tagName) {
    if (typeof tagName === 'string') {
      tagName = tagName.toLowerCase()
      return this.cache.find(otherTagName => otherTagName.name.toLowerCase() === tagName) || null
    }
    return super.resolve(tagName)
  }

  resolveID (tagName) {
    if (tagName instanceof this.holds) {
      return tagName.name
    }
    if (typeof tagName === 'string') {
      tagName = tagName.toLowerCase()
      return this.cache.find(otherTagName => otherTagName.name.toLowerCase() === tagName)?.name ?? tagName
    }
    return null
  }
}

module.exports = TagTagNameManager

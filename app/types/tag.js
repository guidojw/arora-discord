'use strict'
const BaseArgumentType = require('./base')

const { Tag } = require('../structures')

class TagArgumentType extends BaseArgumentType {
  constructor (client) {
    super(client, Tag)
  }

  filterExact (search) {
    return function (structure) {
      return structure instanceof this.holds && structure.names.resolve(search) !== null
    }
  }

  filterInexact (search) {
    return function (structure) {
      return structure instanceof this.holds && structure.names.cache.some(tagName => (
        tagName.name.toLowerCase().includes(search)
      ))
    }
  }
}

module.exports = TagArgumentType

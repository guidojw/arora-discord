'use strict'
const BaseStructure = require('./base')

class TagName extends BaseStructure {
  constructor (client, data, tag) {
    super(client)

    this.tag = tag

    this._setup(data)
  }

  _setup (data) {
    this.name = data.name
  }

  delete () {
    return this.tag.names.delete(this)
  }
}

module.exports = TagName

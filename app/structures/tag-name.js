'use strict'
class TagName {
  constructor (tag, data) {
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

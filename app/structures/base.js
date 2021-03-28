'use strict'

class BaseStructure {
  constructor (client) {
    this.client = client
  }

  _setup (data) {
    return data
  }
}

module.exports = BaseStructure

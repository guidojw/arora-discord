'use strict'
class BaseStructure {
  constructor (client) {
    this.client = client
  }

  _patch (data) {
    return data
  }
}

module.exports = BaseStructure

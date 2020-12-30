'use strict'
const BaseStructure = require('./base')

class GroupController extends BaseStructure {
  constructor (client, data) {
    super(client)

    this._patch(data)
  }

  _patch (data) {

  }
}

module.exports = GroupController

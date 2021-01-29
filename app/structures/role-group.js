'use strict'
const Collection = require('@discordjs/collection')
const Group = require('./group')

class RoleGroup extends Group {
  constructor (client, data) {
    super(client, data)

    this.roles = new Collection()
    this.permissions = []
  }

  _patch (data) {
    super._patch(data)

    if (data.permissions) {
      for (const permission of data.permissions) {

      }
    }

    if (data.roles) {
      for (const role of data.roles) {

      }
    }
  }
}

module.exports = RoleGroup

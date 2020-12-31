'use strict'
const BaseStructure = require('./base')

class RoleController extends BaseStructure {
  constructor (client, data) {
    super(client)

    this.permissions = []

    this._patch(data)
  }

  _patch (data) {
    this.id = data.id
    this.guildId = data.guildId

    if (data.permissions) {
      for (const { name, RolePermission: { type } } of data.permissions) {
        this.permissions.push({ name, type })
      }
    }
  }
}

module.exports = RoleController

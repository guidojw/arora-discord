'use strict'

const BaseStructure = require('./base')

class Permission extends BaseStructure {
  constructor (client, data, permissible) {
    super(client)

    this.permissible = permissible

    this._setup(data)
  }

  _setup (data) {
    this.id = data.id
    this.allow = data.allow
    this.commandId = data.commandId
  }

  update (data) {
    return this.permissible.aroraPermissions.update(this, data)
  }

  delete () {
    return this.permissible.aroraPermissions.delete(this)
  }
}

module.exports = Permission

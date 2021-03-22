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
    return this.guild.panels.update(this, data)
  }

  delete () {
    return this.guild.panels.delete(this)
  }
}

module.exports = Permission

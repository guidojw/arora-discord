'use strict'
const PermissionManager = require('../../managers/permission')

class Permissible {
  constructor () {
    this.nsadminPermissions = new PermissionManager(this)
  }

  permissionFor (command) {
    const commandPermission = this.nsadminPermissions.resolve(command)?.allow ?? null
    const groupPermission = this.nsadminPermissions.resolve(command.group)?.allow ?? null
    return commandPermission !== groupPermission
      ? commandPermission !== false && groupPermission !== false
      : commandPermission
  }

  static applyToClass (structure) {
    const props = ['permissionFor']
    for (const prop of props) {
      Object.defineProperty(
        structure.prototype,
        prop,
        Object.getOwnPropertyDescriptor(Permissible.prototype, prop)
      )
    }
  }
}

module.exports = Permissible

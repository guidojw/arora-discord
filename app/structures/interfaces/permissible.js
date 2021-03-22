'use strict'
const PermissionManager = require('../../managers/permission')

class Permissible {
  constructor () {
    this.nsadminPermissions = new PermissionManager(this)
  }

  static applyToClass (structure) {
    const props = []
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

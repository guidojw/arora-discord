'use strict'
class Permissible {
  constructor () {
    this.permissions = []
  }

  can (name) {
    return this.permissions.contains(name)
  }

  static applyToClass (structure) {
    const props = ['can']
    for (const prop of props) {
      Object.defineProperty(
        structure.prototype,
        prop,
        Object.getOwnPropertyDescriptor(Permissible, prop)
      )
    }
  }
}

module.exports = Permissible

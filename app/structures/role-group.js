'use strict'
const Collection = require('@discordjs/collection')
const Permissible = require('./interfaces/permissible')
const Group = require('./group')

class RoleGroup extends Group {
  constructor (client, data, guild) {
    super(client, data, guild)

    this.roles = new Collection()
    this.permissions = []
  }

  _setup (data) {
    super._setup(data)

    if (data.permissions) {
      for (const { name } of data.permissions) {
        this.permissions.push(name)
      }
    }

    if (data.roles) {
      for (const rawRole of data.roles) {
        const role = this.guild.roles.cache.get(rawRole.id)
        if (role) {
          this.roles.set(role.id, role)
        }
      }
    }
  }
}

Permissible.applyToClass(RoleGroup)

module.exports = RoleGroup

'use strict'
const BaseManager = require('./base')
const Permission = require('../structures/permission')

const { Role } = require('discord.js')
const { Command } = require('discord.js-commando')
const { Permission: PermissionModel } = require('../models')

class PermissionManager extends BaseManager {
  constructor (permissible, iterable) {
    super(permissible.client, iterable, Permission)

    this.permissible = permissible
    this.guild = permissible.guild
  }

  add (data, cache = true) {
    return super.add(data, cache, { extras: [this.permissible] })
  }

  async create (commandOrGroup, allow) {
    try {
      commandOrGroup = this.client.registry.resolveCommand(commandOrGroup)
    } catch {
      try {
        commandOrGroup = this.client.registry.resolveGroup(commandOrGroup)
      } catch {
        throw new Error('Invalid command or command group.')
      }
    }
    if (commandOrGroup.guarded || (commandOrGroup instanceof Command && commandOrGroup.group.guarded)) {
      throw new Error('Cannot create permissions for guarded commands or command groups.')
    }
    if (commandOrGroup.id === 'util' || commandOrGroup.groupID === 'util') {
      throw new Error('Cannot create permissions for `Utility` command group or commands in it.')
    }
    if (this.resolve(commandOrGroup)) {
      throw new Error('A permission for that command or command group already exists.')
    }
    const commandId = commandOrGroup.nsadminId

    const permission = await PermissionModel.create({
      roleId: this.permissible instanceof Role ? this.permissible.id : null,
      groupId: !(this.permissible instanceof Role) ? this.permissible.id : null,
      commandId,
      allow
    }, {
      guildId: this.guild.id
    })

    return this.add(permission)
  }

  async delete (permission) {
    const id = this.resolveID(permission)
    if (!id) {
      throw new Error('Invalid permission.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Permission not found.')
    }

    await PermissionModel.destroy({ where: { id } })
    this.cache.delete(id)
  }

  async update (permission, data) {
    const id = this.resolveID(permission)
    if (!id) {
      throw new Error('Invalid permission.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Permission not found.')
    }

    const changes = {}
    if (typeof data.allow !== 'undefined') {
      changes.allow = data.allow
    }

    const [, [newData]] = await PermissionModel.update(changes, {
      where: { id },
      returning: true
    })

    const _permission = this.cache.get(id)
    _permission?._setup(newData)
    return _permission ?? this.add(newData, false)
  }

  resolve (permission) {
    const permissionResolvable = super.resolve(permission)
    if (permissionResolvable) {
      return permissionResolvable
    }
    let commandId
    try {
      commandId = this.client.registry.resolveCommand(permission).nsadminId
    } catch {
      try {
        commandId = this.client.registry.resolveGroup(permission).nsadminId
      } catch {} // eslint-disable-line no-empty
    }
    if (commandId) {
      return this.cache.find(otherPermission => otherPermission.commandId === commandId) || null
    }
    return null
  }

  resolveID (permission) {
    const permissionResolvable = super.resolve(permission)
    if (permissionResolvable) {
      return permissionResolvable.id
    }
    let commandId
    try {
      commandId = this.client.registry.resolveCommand(permission).nsadminId
    } catch {
      try {
        commandId = this.client.registry.resolveGroup(permission).nsadminId
      } catch {} // eslint-disable-line no-empty
    }
    if (commandId) {
      return this.cache.find(otherPermission => otherPermission.commandId === commandId)?.id ?? null
    }
    return null
  }
}

module.exports = PermissionManager

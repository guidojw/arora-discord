import { Command, CommandGroup } from 'discord.js-commando'
import type { PermissibleType, PermissionUpdateOptions } from '../structures'
import BaseManager from './base'
import type { CommandoClient } from 'discord.js-commando'
import type { Guild } from 'discord.js'
import Permission from '../structures/permission'
import type { Permission as PermissionEntity } from '../entities'
import type { Repository } from 'typeorm'
import { Role } from 'discord.js'
import { constants } from '../util'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

export type CommandOrCommandGroupResolvable = Command | CommandGroup | string
export type PermissionResolvable = CommandOrCommandGroupResolvable | Permission | number

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

// @ts-expect-error
export default class PermissionManager extends BaseManager<Permission, PermissionResolvable> {
  @lazyInject(TYPES.PermissionRepository)
  private readonly permissionRepository!: Repository<PermissionEntity>

  public readonly permissible: PermissibleType
  public readonly guild: Guild

  public constructor (permissible: PermissibleType) {
    super(permissible.client, Permission)

    this.permissible = permissible
    this.guild = permissible.guild
  }

  public override _add (data: PermissionEntity, cache = true): Permission {
    // @ts-expect-error
    return super._add(data, cache, { id: data.id, extras: [this.permissible] })
  }

  public async create (commandOrCommandGroup: CommandOrCommandGroupResolvable, allow: boolean): Promise<Permission> {
    if (typeof commandOrCommandGroup === 'string') {
      try {
        commandOrCommandGroup = (this.client as CommandoClient).registry.resolveCommand(commandOrCommandGroup)
      } catch {
        try {
          commandOrCommandGroup = (this.client as CommandoClient).registry.resolveGroup(commandOrCommandGroup as string)
        } catch {
          throw new Error('Invalid command or command group.')
        }
      }
    }
    if (commandOrCommandGroup.guarded ||
      (commandOrCommandGroup instanceof Command && commandOrCommandGroup.group.guarded)) {
      throw new Error('Cannot create permissions for guarded commands or command groups.')
    }
    if (commandOrCommandGroup instanceof Command
      ? commandOrCommandGroup.groupID === 'util'
      : commandOrCommandGroup.id === 'util') {
      throw new Error('Cannot create permissions for `Utility` command group or commands in it.')
    }
    if (this.resolve(commandOrCommandGroup) !== null) {
      throw new Error('A permission for that command or command group already exists.')
    }
    const commandId = commandOrCommandGroup.aroraId

    const permission = await this.permissionRepository.save(this.permissionRepository.create({
      roleId: this.permissible instanceof Role ? this.permissible.id : null,
      groupId: !(this.permissible instanceof Role) ? this.permissible.id : null,
      commandId,
      allow
    }), {
      data: { guildId: this.guild.id }
    })

    return this._add(permission)
  }

  public async delete (permission: PermissionResolvable): Promise<void> {
    const id = this.resolveId(permission)
    if (id === null) {
      throw new Error('Invalid permission.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Permission not found.')
    }

    await this.permissionRepository.delete(id)
    this.cache.delete(id)
  }

  public async update (
    permission: PermissionResolvable,
    data: PermissionUpdateOptions
  ): Promise<Permission> {
    const id = this.resolveId(permission)
    if (id === null) {
      throw new Error('Invalid permission.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Permission not found.')
    }

    const changes: Partial<PermissionEntity> = {}
    if (typeof data.allow !== 'undefined') {
      changes.allow = data.allow
    }

    const newData = await this.permissionRepository.save(this.permissionRepository.create({
      id,
      ...changes
    }))

    const _permission = this.cache.get(id)
    _permission?.setup(newData)
    return _permission ?? this._add(newData, false)
  }

  public override resolve (permission: Permission): Permission
  public override resolve (permission: PermissionResolvable): Permission | null
  public override resolve (permission: PermissionResolvable): Permission | null {
    const otherPermission = super.resolve(permission)
    if (otherPermission !== null) {
      return otherPermission
    }
    let commandId: number | undefined
    if (permission instanceof Command || typeof permission === 'string') {
      try {
        commandId = (this.client as CommandoClient).registry.resolveCommand(permission).aroraId
      } catch {}
    }
    if (typeof commandId === 'undefined' &&
      (permission instanceof CommandGroup || typeof permission === 'string')) {
      try {
        commandId = (this.client as CommandoClient).registry.resolveGroup(permission).aroraId
      } catch {}
    }
    if (typeof commandId !== 'undefined') {
      return this.cache.find(otherPermission => otherPermission.commandId === commandId) ?? null
    }
    return null
  }

  public override resolveId (permission: number): number
  public override resolveId (permission: PermissionResolvable): number | null
  public override resolveId (permission: PermissionResolvable): number | null {
    if (!(typeof permission === 'number' || permission instanceof Permission)) {
      return this.resolve(permission)?.id ?? null
    }
    return super.resolveId(permission)
  }
}

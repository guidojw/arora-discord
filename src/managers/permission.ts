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

export default class PermissionManager extends BaseManager<Permission, PermissionResolvable> {
  @lazyInject(TYPES.PermissionRepository)
  private readonly permissionRepository!: Repository<PermissionEntity>

  public readonly permissible: PermissibleType
  public readonly guild: Guild

  public constructor (permissible: PermissibleType, iterable?: Iterable<PermissionEntity>) {
    // @ts-expect-error
    super(permissible.client, iterable, Permission)

    this.permissible = permissible
    this.guild = permissible.guild
  }

  public override add (data: PermissionEntity, cache = true): Permission {
    return super.add(data, cache, { id: data.id, extras: [this.permissible] })
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

    return this.add(permission)
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
    return _permission ?? this.add(newData, false)
  }

  public override resolve (permissionResolvable: PermissionResolvable): Permission | null {
    const permission = super.resolve(permissionResolvable)
    if (permission !== null) {
      return permission
    }
    let commandId: number | undefined
    if (permissionResolvable instanceof Command || typeof permissionResolvable === 'string') {
      try {
        commandId = (this.client as CommandoClient).registry.resolveCommand(permissionResolvable).aroraId
      } catch {}
    }
    if (typeof commandId === 'undefined' &&
      (permissionResolvable instanceof CommandGroup || typeof permissionResolvable === 'string')) {
      try {
        commandId = (this.client as CommandoClient).registry.resolveGroup(permissionResolvable).aroraId
      } catch {}
    }
    if (typeof commandId !== 'undefined') {
      return this.cache.find(otherPermission => otherPermission.commandId === commandId) ?? null
    }
    return null
  }

  public override resolveId (permissionResolvable: PermissionResolvable): number | null {
    const permission = super.resolve(permissionResolvable)
    if (permission !== null) {
      return permission.id
    }
    let commandId: number | undefined
    if (permissionResolvable instanceof Command || typeof permissionResolvable === 'string') {
      try {
        commandId = (this.client as CommandoClient).registry.resolveCommand(permissionResolvable).aroraId
      } catch {}
    }
    if (typeof commandId === 'undefined' &&
      (permissionResolvable instanceof CommandGroup || typeof permissionResolvable === 'string')) {
      try {
        commandId = (this.client as CommandoClient).registry.resolveGroup(permissionResolvable).aroraId
      } catch {}
    }
    if (typeof commandId !== 'undefined') {
      return this.cache.find(otherPermission => otherPermission.commandId === commandId)?.id ?? null
    }
    return null
  }
}

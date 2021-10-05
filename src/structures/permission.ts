import type { Client, Role } from 'discord.js'
import BaseStructure from './base'
import type { Permission as PermissionEntity } from '../entities'
import type RoleGroup from './role-group'

export interface PermissionUpdateOptions { allow?: boolean }

export default class Permission extends BaseStructure {
  public readonly permissible: Role | RoleGroup
  public id!: number
  public allow!: boolean
  public commandId!: number

  public constructor (client: Client<true>, data: PermissionEntity, permissible: Role | RoleGroup) {
    super(client)

    this.permissible = permissible

    this.setup(data)
  }

  public setup (data: PermissionEntity): void {
    this.id = data.id
    this.allow = data.allow
    this.commandId = data.commandId
  }

  public async update (data: PermissionUpdateOptions): Promise<Permission> {
    return await this.permissible.aroraPermissions.update(this, data)
  }

  public async delete (): Promise<void> {
    return await this.permissible.aroraPermissions.delete(this)
  }
}

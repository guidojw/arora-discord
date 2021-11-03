import BaseStructure from './base'
import type { Client } from 'discord.js'
import type { PermissibleType } from './mixins'
import type { Permission as PermissionEntity } from '../entities'

export interface PermissionUpdateOptions { allow?: boolean }

export default class Permission extends BaseStructure {
  public readonly permissible: PermissibleType

  public id!: number
  public allow!: boolean
  public commandId!: number

  public constructor (client: Client<true>, data: PermissionEntity, permissible: PermissibleType) {
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

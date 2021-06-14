import BaseStructure from './base'
import Client from '../client/client'
import { Role } from 'discord.js'
import RoleGroup from './role-group'

export default class Permission extends BaseStructure {
  public readonly permissible: Role | RoleGroup
  public id!: number
  public allow!: boolean
  public commandId!: number

  public constructor (client: Client, data: any, permissible: Role | RoleGroup) {
    super(client)

    this.permissible = permissible

    this.setup(data)
  }

  public setup (data: any): void {
    this.id = data.id
    this.allow = data.allow
    this.commandId = data.commandId
  }

  public async update (data: any): Promise<this> {
    return await this.permissible.aroraPermissions.update(this, data)
  }

  public async delete (): Promise<void> {
    return await this.permissible.aroraPermissions.delete(this)
  }
}

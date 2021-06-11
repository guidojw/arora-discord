import BaseStructure from './base'
import Client from '../client/client'
import { Role } from 'discord.js'
import RoleGroup from './role-group'

export default class Permission extends BaseStructure {
  readonly permissible: Role | RoleGroup
  id!: string
  allow!: boolean
  commandId!: number

  constructor (client: Client, data: any, permissible: Role | RoleGroup) {
    super(client)

    this.permissible = permissible

    this.setup(data)
  }

  setup (data: any): void {
    this.id = data.id
    this.allow = data.allow
    this.commandId = data.commandId
  }

  update (data: any): this {
    return this.permissible.aroraPermissions.update(this, data)
  }

  delete (): void {
    return this.permissible.aroraPermissions.delete(this)
  }
}

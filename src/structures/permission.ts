import BaseStructure from './base'
import { CommandoClient } from 'discord.js-commando'
import { Role } from '../extensions'
import RoleGroup from './role-group'

export default class Permission implements BaseStructure {
  readonly client: CommandoClient
  readonly permissible: Role | RoleGroup
  id!: string
  allow!: boolean
  commandId!: number


  constructor (client: CommandoClient, data: any, permissible: Role | RoleGroup) {
    this.client = client
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

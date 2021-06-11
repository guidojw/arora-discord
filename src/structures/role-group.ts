import Client from '../client/client'
import Group from './group'
import GroupRoleManager from '../managers/group-role'
import { Guild } from 'discord.js'
import Permissible from './mixins/permissible'

export default class RoleGroup extends Permissible(Group) {
  _roles: string[]

  constructor (client: Client, data: any, guild: Guild) {
    super(client, data, guild)

    this._roles = []

    this.setup(data)
  }

  setup (data: any): void {
    super.setup(data)

    if (typeof data.permissions !== 'undefined') {
      for (const rawPermission of data.permissions) {
        this.aroraPermissions.add(rawPermission)
      }
    }

    if (typeof data.roles !== 'undefined') {
      this._roles = data.roles.map((role: { id: string }) => role.id)
    }
  }

  get roles (): GroupRoleManager {
    return new GroupRoleManager(this)
  }
}

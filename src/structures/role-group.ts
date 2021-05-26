import { CommandoClient } from 'discord.js-commando'
import Group from './group'
import { Guild } from 'discord.js'
import Permissible from './mixins/permissible'
import GroupRoleManager from '../managers/group-role'
import PermissionManager from '../managers/permission'

export default class RoleGroup extends Group {
  readonly aroraPermissions: PermissionManager
  _roles: string[]

  constructor (client: CommandoClient, data: any, guild: Guild) {
    super(client, data, guild)

    this.aroraPermissions = new PermissionManager(this)
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

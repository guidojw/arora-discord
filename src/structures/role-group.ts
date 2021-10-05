import type { Client, Guild } from 'discord.js'
import Group from './group'
import type { Group as GroupEntity } from '../entities'
import GroupRoleManager from '../managers/group-role'
import Permissible from './mixins/permissible'

export default class RoleGroup extends Permissible(Group) {
  public _roles: string[]

  public constructor (client: Client<true>, data: GroupEntity, guild: Guild) {
    super(client, data, guild)

    this._roles = []

    this.setup(data)
  }

  public override setup (data: GroupEntity): void {
    super.setup(data)

    if (typeof data.permissions !== 'undefined') {
      for (const rawPermission of data.permissions) {
        this.aroraPermissions.add(rawPermission)
      }
    }

    if (typeof data.roles !== 'undefined') {
      this._roles = data.roles.map(role => role.id)
    }
  }

  public get roles (): GroupRoleManager {
    return new GroupRoleManager(this)
  }
}

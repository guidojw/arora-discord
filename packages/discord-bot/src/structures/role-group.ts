import { type ManagerFactory, constants } from '../utils'
import { inject, injectable } from 'inversify'
import Group from './group'
import type { Group as GroupEntity } from '../entities'
import type { GroupRoleManager } from '../managers'
import type { GuildContext } from '.'
import type { Role } from 'discord.js'

const { TYPES } = constants

@injectable()
export default class RoleGroup extends Group {
  @inject(TYPES.ManagerFactory)
  private readonly managerFactory!: ManagerFactory

  public _roles: string[]

  public constructor () {
    super()

    this._roles = []
  }

  public override setOptions (data: GroupEntity, context: GuildContext): void {
    super.setOptions(data, context)

    this.setup(data)
  }

  public override setup (data: GroupEntity): void {
    super.setup(data)

    if (typeof data.roles !== 'undefined') {
      this._roles = data.roles.map(role => role.id)
    }
  }

  public get roles (): GroupRoleManager {
    return this.managerFactory<GroupRoleManager, Role>('GroupRoleManager')(this)
  }
}

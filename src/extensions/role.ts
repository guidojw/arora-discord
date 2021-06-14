import { Command, CommandGroup } from 'discord.js-commando'
import { PermissionManager, RoleGroupManager } from '../managers'
import { Role, Structures } from 'discord.js'
import { BaseStructure } from '../structures'
import Permissible from '../structures/mixins/permissible'

declare module 'discord.js' {
  interface Role {
    groups: RoleGroupManager

    setup (data: any): void

    readonly aroraPermissions: PermissionManager
    permissionFor (commandOrGroup: Command | CommandGroup): boolean | null
  }
}

// @ts-expect-error
const AroraRole: Role = Structures.extend('Role', Role => (
  class AroraRole extends Permissible(Role) implements Omit<BaseStructure, 'client'> {
    public setup (data: any): void {
      for (const rawPermission of data.permissions) {
        this.aroraPermissions.add(rawPermission)
      }
    }

    public get groups (): RoleGroupManager {
      return new RoleGroupManager(this)
    }
  }
))

export default AroraRole

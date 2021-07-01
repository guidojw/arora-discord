import type { Command, CommandGroup } from 'discord.js-commando'
import { PermissionManager, RoleGroupManager } from '../managers'
import type { BaseStructure } from '../structures'
import Permissible from '../structures/mixins/permissible'
import type { Role } from 'discord.js'
import type { Role as RoleEntity } from '../entities'
import { Structures } from 'discord.js'

declare module 'discord.js' {
  interface Role {
    groups: RoleGroupManager

    setup (data: RoleEntity): void

    readonly aroraPermissions: PermissionManager
    permissionFor (commandOrGroup: Command | CommandGroup): boolean | null
  }
}

// @ts-expect-error
const AroraRole: Role = Structures.extend('Role', Role => (
  class AroraRole extends Permissible(Role) implements Omit<BaseStructure, 'client'> {
    public override setup (data: RoleEntity): void {
      if (typeof data.permissions !== 'undefined') {
        for (const rawPermission of data.permissions) {
          this.aroraPermissions.add(rawPermission)
        }
      }
    }

    public override get groups (): RoleGroupManager {
      return new RoleGroupManager(this)
    }
  }
))

export default AroraRole

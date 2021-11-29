import type { Command, CommandGroup } from 'discord.js-commando'
import { type PermissionManager, RoleGroupManager } from '../managers'
import { type Role, Structures } from 'discord.js'
import type { BaseStructure } from '../structures'
import Permissible from '../structures/mixins/permissible'
import type { Role as RoleEntity } from '../entities'

declare module 'discord.js' {
  interface Role {
    groups: RoleGroupManager
    readonly aroraPermissions: PermissionManager

    setup: (data: RoleEntity) => void
    permissionFor: (commandOrGroup: Command | CommandGroup) => boolean | null
  }
}

// @ts-expect-error
const AroraRole: Role = Structures.extend('Role', Role => (
  class AroraRole extends Permissible(Role) implements Omit<BaseStructure, 'client'> {
    // @ts-expect-error
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

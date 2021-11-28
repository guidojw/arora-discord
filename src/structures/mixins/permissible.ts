import type { Constructor, Mixin } from '../../util/util'
import { Command, type CommandGroup } from 'discord.js-commando'
import type Group from '../group'
import PermissionManager from '../../managers/permission'
import type { Role } from 'discord.js'

export type PermissibleType = Mixin<typeof Permissible>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Permissible<T extends Constructor<Group> | Constructor<Role>> (
  base: T
) {
  class Permissible extends base {
    public readonly aroraPermissions: PermissionManager

    private constructor (...args: any[]) {
      super(...args)

      this.aroraPermissions = new PermissionManager(this as unknown as PermissibleType)
    }

    public permissionFor (commandOrGroup: Command | CommandGroup, bypassGroup: boolean = false): boolean | null {
      const commandPermission = this.aroraPermissions.resolve(commandOrGroup)?.allow ?? null
      const groupPermission = commandOrGroup instanceof Command
        ? this.aroraPermissions.resolve(commandOrGroup.group)?.allow ?? null
        : null

      return (bypassGroup || commandPermission === groupPermission)
        ? commandPermission
        : commandPermission !== false && groupPermission !== false
    }
  }

  return Permissible
}

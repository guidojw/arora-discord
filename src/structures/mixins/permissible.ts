import { AbstractConstructor, Constructor } from '../../util/util'
import { Command, CommandGroup } from 'discord.js-commando'
import BaseStructure from '../base'
import { Base as DiscordBaseStructure } from 'discord.js'
import PermissionManager from '../../managers/permission'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Permissible<T extends AbstractConstructor<BaseStructure> | Constructor<DiscordBaseStructure>> (
  Base: T
) {
  class Permissible extends Base {
    public readonly aroraPermissions: PermissionManager

    public constructor (...args: any[]) {
      super(...args)

      this.aroraPermissions = new PermissionManager()
    }

    public permissionFor (commandOrGroup: Command | CommandGroup, bypassGroup: boolean = false): boolean | null {
      const commandPermission = this.aroraPermissions.resolve(commandOrGroup)?.allow ?? null
      const groupPermission = this.aroraPermissions.resolve(commandOrGroup instanceof Command
        ? commandOrGroup.group
        : undefined
      )?.allow ?? null
      return (bypassGroup || commandPermission === groupPermission)
        ? commandPermission
        : commandPermission !== false && groupPermission !== false
    }
  }

  return Permissible
}

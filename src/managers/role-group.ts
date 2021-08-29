import type { Collection, Guild, Role } from 'discord.js'
import type { RoleGroup } from '../structures'

export default class RoleGroupManager {
  public readonly role: Role
  public readonly guild: Guild

  public constructor (role: Role) {
    this.role = role
    this.guild = role.guild
  }

  public get cache (): Collection<number, RoleGroup> {
    return this.guild.groups.cache.filter(group => {
      return group.isRoleGroup() && group.roles.cache.has(this.role.id)
    }) as Collection<number, RoleGroup>
  }
}

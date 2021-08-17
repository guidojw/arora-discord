import type { Collection, Guild, Role, Snowflake } from 'discord.js'
import type { RoleGroup } from '../structures'

export default class RoleGroupManager {
  public role: Role
  public guild: Guild

  public constructor (role: Role) {
    this.role = role
    this.guild = role.guild
  }

  public get cache (): Collection<Snowflake, RoleGroup> {
    return this.guild.groups.cache.filter(group => {
      return group.isRoleGroup() && group.roles.cache.has(this.role.id)
    })
  }
}

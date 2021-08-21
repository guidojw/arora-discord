import type { Collection, Guild, Role, RoleResolvable, Snowflake } from 'discord.js'
import type { Group as GroupEntity, Role as RoleEntity } from '../entities'
import type { Repository } from 'typeorm'
import type { RoleGroup } from '../structures'
import { constants } from '../util'
import { inject } from 'inversify'

const { TYPES } = constants

export default class GroupRoleManager {
  @inject(TYPES.GroupRepository) private readonly groupRepository!: Repository<GroupEntity>

  private readonly group: RoleGroup
  private readonly guild: Guild

  public constructor (group: RoleGroup) {
    this.group = group
    this.guild = group.guild
  }

  public get cache (): Collection<Snowflake, Role> {
    return this.guild.roles.cache.filter(role => this.group._roles.includes(role.id))
  }

  public async add (roleResolvable: RoleResolvable): Promise<RoleGroup> {
    const role = this.guild.roles.resolve(roleResolvable)
    if (role === null) {
      throw new Error('Invalid role.')
    }
    if (this.cache.has(role.id)) {
      throw new Error('Role not found.')
    }

    const group = await this.groupRepository.findOne(
      this.group.id,
      { relations: ['channels', 'roles'] }
    ) as GroupEntity & { roles: RoleEntity[] }
    group.roles.push({ id: role.id, guildId: this.guild.id })
    await this.groupRepository.save(group)
    this.group._roles.push(role.id)

    return this.group
  }

  public async remove (role: RoleResolvable): Promise<RoleGroup> {
    const id = this.guild.roles.resolveID(role)
    if (id === null) {
      throw new Error('Invalid role.')
    }
    if (!this.group._roles.includes(id)) {
      throw new Error('Role not found.')
    }

    const group = await this.groupRepository.findOne(
      this.group.id,
      { relations: ['channels', 'roles'] }
    ) as GroupEntity & { roles: RoleEntity[] }
    group.roles = group.roles.filter(role => role.id !== id)
    await this.groupRepository.save(group)
    this.group._roles = this.group._roles.filter(roleId => roleId !== id)

    return this.group
  }
}

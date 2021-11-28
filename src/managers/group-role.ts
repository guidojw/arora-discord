import type { Collection, Guild, Role, RoleResolvable, Snowflake } from 'discord.js'
import type { Group as GroupEntity, Role as RoleEntity } from '../entities'
import type { Repository } from 'typeorm'
import type { RoleGroup } from '../structures'
import { constants } from '../util'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

export default class GroupRoleManager {
  @lazyInject(TYPES.GroupRepository)
  private readonly groupRepository!: Repository<GroupEntity>

  public readonly group: RoleGroup
  public readonly guild: Guild

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
    this.group.setup(group)

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
    this.group.setup(group)

    return this.group
  }
}

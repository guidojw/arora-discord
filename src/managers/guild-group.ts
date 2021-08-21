import { inject, injectable } from 'inversify'
import BaseManager from './base'
import { Group } from '../structures'
import type { Group as GroupEntity } from '../entities'
import type { GroupType } from '../util/constants'
import type { GroupUpdateOptions } from '../structures'
import type { Guild } from 'discord.js'
import type { Repository } from 'typeorm'
import { constants } from '../util'

export type GroupResolvable = string | Group | number

const { TYPES } = constants

@injectable()
export default class GuildGroupManager extends BaseManager<Group, GroupResolvable> {
  @inject(TYPES.GroupRepository) private readonly groupRepository!: Repository<GroupEntity>

  public guild: Guild

  public constructor (guild: Guild, iterable?: Iterable<GroupEntity>) {
    // @ts-expect-error
    super(guild.client, iterable, Group)

    this.guild = guild
  }

  public override add (data: GroupEntity, cache = true): Group {
    const existing = this.cache.get(data.id)
    if (typeof existing !== 'undefined') {
      return existing
    }

    const group = Group.create(this.client, data, this.guild)
    if (cache) {
      this.cache.set(group.id, group)
    }
    return group
  }

  public async create (name: string, type: GroupType): Promise<Group> {
    if (this.resolve(name) !== null) {
      throw new Error('A group with that name already exists.')
    }

    const group = await this.groupRepository.save(this.groupRepository.create({
      guildId: this.guild.id,
      name,
      type
    }))

    return this.add(group)
  }

  public async delete (groupResolvable: GroupResolvable): Promise<void> {
    const group = this.resolve(groupResolvable)
    if (group === null) {
      throw new Error('Invalid group.')
    }
    if (!this.cache.has(group.id)) {
      throw new Error('Group not found.')
    }
    if (group.guarded) {
      throw new Error('Guarded groups cannot be deleted.')
    }

    await this.groupRepository.delete(group.id)
    this.cache.delete(group.id)
  }

  public async update (
    group: GroupResolvable,
    data: GroupUpdateOptions
  ): Promise<Group> {
    const id = this.resolveID(group)
    if (id === null) {
      throw new Error('Invalid group.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Group not found.')
    }

    const changes: Partial<GroupEntity> = {}
    if (typeof data.name !== 'undefined') {
      if (this.resolve(data.name) !== null) {
        throw new Error('A group with that name already exists.')
      }
      changes.name = data.name
    }

    const newData = await this.groupRepository.save(this.groupRepository.create({
      id,
      ...changes
    }))

    const _group = this.cache.get(id)
    _group?.setup(newData)
    return _group ?? this.add(newData, false)
  }

  public override resolve (group: GroupResolvable): Group | null {
    if (typeof group === 'string') {
      group = group.toLowerCase()
      return this.cache.find(otherGroup => otherGroup.name.toLowerCase() === group) ?? null
    }
    return super.resolve(group)
  }

  public override resolveID (group: GroupResolvable): number | null {
    if (typeof group === 'string') {
      group = group.toLowerCase()
      return this.cache.find(otherGroup => otherGroup.name.toLowerCase() === group)?.id ?? null
    }
    return super.resolveID(group)
  }
}
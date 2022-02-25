import { Group, type GroupUpdateOptions, type GuildContext } from '../structures'
import BaseManager from './base'
import type { Group as GroupEntity } from '../entities'
import type { GroupType } from '../utils/constants'
import type { Repository } from 'typeorm'
import { constants } from '../utils'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

export type GroupResolvable = string | Group | number

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

export default class GuildGroupManager extends BaseManager<Group, GroupResolvable> {
  @lazyInject(TYPES.GroupRepository)
  private readonly groupRepository!: Repository<GroupEntity>

  public readonly context: GuildContext

  public constructor (context: GuildContext) {
    super(context.client, Group)

    this.context = context
  }

  public override _add (data: GroupEntity, cache = true): Group {
    const existing = this.cache.get(data.id)
    if (typeof existing !== 'undefined') {
      return existing
    }

    const group = Group.create(this.client, data, this.context)
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
      guildId: this.context.id,
      name,
      type
    }))

    return this._add(group)
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
    const id = this.resolveId(group)
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
    return _group ?? this._add(newData, false)
  }

  public override resolve (group: Group): Group
  public override resolve (group: GroupResolvable): Group | null
  public override resolve (group: GroupResolvable): Group | null {
    if (typeof group === 'string') {
      group = group.toLowerCase()
      return this.cache.find(otherGroup => otherGroup.name.toLowerCase() === group) ?? null
    }
    return super.resolve(group)
  }

  public override resolveId (group: number): number
  public override resolveId (group: GroupResolvable): number | null
  public override resolveId (group: GroupResolvable): number | null {
    if (typeof group === 'string') {
      return this.resolve(group)?.id ?? null
    }
    return super.resolveId(group)
  }
}

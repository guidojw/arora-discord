import { type ChannelGroup, Group, type GroupUpdateOptions, type GuildContext, type RoleGroup } from '../structures'
import { inject, injectable } from 'inversify'
import { DataManager } from './base'
import type { Group as GroupEntity } from '../entities'
import { GroupType } from '../utils/constants'
import type { Repository } from 'typeorm'
import { constants } from '../utils'

const { TYPES } = constants

export type GroupResolvable = string | Group | number

@injectable()
export default class GuildGroupManager extends DataManager<number, Group, GroupResolvable, GroupEntity> {
  @inject(TYPES.StructureFactory)
  private readonly groupFactory!: (structureName: string) =>
  (...args: Parameters<ChannelGroup['setOptions'] | RoleGroup['setOptions']>) => ChannelGroup | RoleGroup

  @inject(TYPES.GroupRepository)
  private readonly groupRepository!: Repository<GroupEntity>

  public context!: GuildContext

  public constructor () {
    super(Group)
  }

  public override setOptions (context: GuildContext): void {
    this.context = context
  }

  public override add (data: GroupEntity): Group {
    const existing = this.cache.get(data.id)
    if (typeof existing !== 'undefined') {
      return existing
    }

    const group = this.groupFactory(data.type === GroupType.Channel ? 'ChannelGroup' : 'RoleGroup')(
      data, this.context
    )
    this.cache.set(group.id, group)
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
      ...changes,
      id
    }))

    const _group = this.cache.get(id)
    _group?.setup(newData)
    return _group ?? this.add(newData)
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

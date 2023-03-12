import type { Collection, RoleResolvable } from 'discord.js'
import { type GuildContext, RoleBinding } from '../structures'
import { inject, injectable } from 'inversify'
import { DataManager } from './base'
import { Repository } from 'typeorm'
import type { RoleBinding as RoleBindingEntity } from '../entities'
import { constants } from '../utils'

const { TYPES } = constants

export type RoleBindingResolvable = RoleBinding | number

@injectable()
export default class GuildRoleBindingManager extends DataManager<
number,
RoleBinding,
RoleBindingResolvable,
RoleBindingEntity
> {
  @inject(TYPES.RoleBindingRepository)
  private readonly roleBindingRepository!: Repository<RoleBindingEntity>

  public context!: GuildContext

  public constructor () {
    super(RoleBinding)
  }

  public override setOptions (context: GuildContext): void {
    this.context = context
  }

  public override add (data: RoleBindingEntity): RoleBinding {
    return super.add(data, { id: data.id, extras: [this.context] })
  }

  public async create ({ role: roleResolvable, min, max }: {
    role: RoleResolvable
    min: number
    max?: number
  }): Promise<RoleBinding> {
    if (this.context.robloxGroupId === null) {
      throw new Error('This server is not bound to a Roblox group yet.')
    }
    const role = this.context.guild.roles.resolve(roleResolvable)
    if (role === null) {
      throw new Error('Invalid role.')
    }
    if (typeof max !== 'undefined' && max < min) {
      [min, max] = [max, min]
    }
    await this.fetch()
    if (this.cache.some(roleBinding => (
      roleBinding.roleId === role.id && roleBinding.robloxGroupId === this.context.robloxGroupId &&
      roleBinding.min === min && (typeof max === 'undefined' || roleBinding.max === max)
    ))) {
      throw new Error('A role binding for that role and range already exists.')
    }

    const newData = await this.roleBindingRepository.save(this.roleBindingRepository.create({
      robloxGroupId: this.context.robloxGroupId,
      guildId: this.context.id,
      roleId: role.id,
      max: max ?? null,
      min
    }))

    return this.add(newData)
  }

  public async delete (roleBinding: RoleBindingResolvable): Promise<void> {
    const id = this.resolveId(roleBinding)
    if (id === null) {
      throw new Error('Invalid role binding.')
    }
    await this.fetch()
    if (!this.cache.has(id)) {
      throw new Error('Role binding not found.')
    }

    await this.roleBindingRepository.delete(id)
    this.cache.delete(id)
  }

  public async fetch (): Promise<Collection<number, RoleBinding>> {
    const data = await this.roleBindingRepository.findBy({ guildId: this.context.id })
    this.cache.clear()
    for (const rawRoleBinding of data) {
      this.add(rawRoleBinding)
    }
    return this.cache
  }
}

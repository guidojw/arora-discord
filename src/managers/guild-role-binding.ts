import type { Guild, RoleResolvable } from 'discord.js'
import BaseManager from './base'
import type { Repository } from 'typeorm'
import { RoleBinding } from '../structures'
import type { RoleBinding as RoleBindingEntity } from '../entities'
import { constants } from '../util'
import { inject } from 'inversify'

export type RoleBindingResolvable = RoleBinding | number

const { TYPES } = constants

export default class GuildRoleBindingManager extends BaseManager<RoleBinding, RoleBindingResolvable> {
  @inject(TYPES.RoleBindingRepository) private readonly roleBindingRepository!: Repository<RoleBindingEntity>

  public readonly guild: Guild

  public constructor (guild: Guild, iterable?: Iterable<RoleBindingEntity>) {
    // @ts-expect-error
    super(guild.client, iterable, RoleBinding)

    this.guild = guild
  }

  public override add (data: RoleBindingEntity, cache = true): RoleBinding {
    return super.add(data, cache, { id: data.id, extras: [this.guild] })
  }

  public async create ({ role: roleResolvable, min, max }: {
    role: RoleResolvable
    min: number
    max?: number
  }): Promise<RoleBinding> {
    if (this.guild.robloxGroupId === null) {
      throw new Error('This server is not bound to a Roblox group yet.')
    }
    // await this.fetch()
    const role = this.guild.roles.resolve(roleResolvable)
    if (role === null) {
      throw new Error('Invalid role.')
    }
    if (typeof max !== 'undefined' && max < min) {
      [min, max] = [max, min]
    }
    if (this.cache.some(roleBinding => (
      roleBinding.roleId === role.id && roleBinding.robloxGroupId === this.guild.robloxGroupId &&
      roleBinding.min === min && (typeof max === 'undefined' || roleBinding.max === max)
    ))) {
      throw new Error('A role binding for that role and range already exists.')
    }

    const newData = await this.roleBindingRepository.save(this.roleBindingRepository.create({
      robloxGroupId: this.guild.robloxGroupId,
      guildId: this.guild.id,
      roleId: role.id,
      max: max ?? null,
      min
    }))

    return this.add(newData)
  }

  public async delete (roleBinding: RoleBindingResolvable): Promise<void> {
    const id = this.resolveID(roleBinding)
    if (id === null) {
      throw new Error('Invalid role binding.')
    }
    // await this.fetch() // TODO: remove
    if (!this.cache.has(id)) {
      throw new Error('Role binding not found.')
    }

    await this.roleBindingRepository.delete(id)
    this.cache.delete(id)
  }

  /* eslint-disable max-len */
  // async fetch () { // TODO: remove
  //   const data = await Guild.scope('withRoleBindings').findOne({ where: { id: this.guild.id } })
  //   this.cache.clear()
  //   for (const rawRoleBinding of data.roleBindings) {
  //     this.add(rawRoleBinding)
  //   }
  //   return this.cache
  // }
  /* eslint-enable max-len */
}

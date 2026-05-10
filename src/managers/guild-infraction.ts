import { type GuildContext, Infraction, type InfractionUpdateOptions } from '../structures'
import { inject, injectable } from 'inversify'
import { DataManager } from './base'
import type { Infraction as InfractionEntity } from '../entities'
import type { InfractionType } from '../utils/constants'
import { Repository } from 'typeorm'
import { constants } from '../utils'

const { TYPES } = constants

export type InfractionResolvable = Infraction | number

@injectable()
export default class GuildInfractionManager extends DataManager<
number,
Infraction,
InfractionResolvable,
InfractionEntity
> {
  @inject(TYPES.InfractionRepository)
  private readonly infractionRepository!: Repository<InfractionEntity>

  public context!: GuildContext

  public constructor () {
    super(Infraction)
  }

  public override setOptions (context: GuildContext): void {
    this.context = context
  }

  public override add (data: InfractionEntity): Infraction {
    return super.add(data, { id: data.id, extras: [this.context] })
  }

  public async create (userId: string, authorId: string, type: InfractionType, reason: string): Promise<Infraction> {
    const infraction = await this.infractionRepository.save(this.infractionRepository.create({
      guildId: this.context.id,
      userId,
      authorId,
      type,
      reason
    }))

    return this.add(infraction)
  }

  public async delete (infractionResolvable: InfractionResolvable): Promise<void> {
    const infraction = this.resolve(infractionResolvable)
    if (infraction === null) {
      throw new Error('Invalid infraction.')
    }
    if (!this.cache.has(infraction.id)) {
      throw new Error('Infraction not found.')
    }

    await this.infractionRepository.delete(infraction.id)
    this.cache.delete(infraction.id)
  }

  public async update (
    infraction: InfractionResolvable,
    data: InfractionUpdateOptions
  ): Promise<Infraction> {
    const id = this.resolveId(infraction)
    if (id === null) {
      throw new Error('Invalid infraction.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Infraction not found.')
    }

    const changes: Partial<InfractionEntity> = {}
    if (typeof data.active !== 'undefined') {
      changes.active = data.active
    }
    if (typeof data.reason !== 'undefined') {
      changes.reason = data.reason
    }

    const newData = await this.infractionRepository.save(this.infractionRepository.create({
      ...changes,
      id
    }))

    const _infraction = this.cache.get(id)
    _infraction?.setup(newData)
    return _infraction ?? this.add(newData)
  }
}

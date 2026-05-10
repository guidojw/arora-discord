import BaseStructure from './base'
import type { GuildContext } from '.'
import type { Infraction as InfractionEntity } from '../entities'
import type { InfractionType } from '../utils/constants'
import { injectable } from 'inversify'

export interface InfractionUpdateOptions { active?: boolean, reason?: string }

@injectable()
export default class Infraction extends BaseStructure<InfractionEntity> {
  public context!: GuildContext

  public id!: number
  public createdAt!: Date
  public userId!: string
  public authorId!: string
  public type!: InfractionType
  public active!: boolean
  public reason!: string

  public setOptions (data: InfractionEntity, context: GuildContext): void {
    this.context = context

    this.setup(data)
  }

  public setup (data: InfractionEntity): void {
    this.id = data.id
    this.createdAt = data.createdAt
    this.userId = data.userId
    this.authorId = data.authorId
    this.type = data.type
    this.active = data.active
    this.reason = data.reason
  }

  public async update (data: InfractionUpdateOptions): Promise<Infraction> {
    return await this.context.infractions.update(this, data)
  }

  public async delete (): Promise<void> {
    await this.context.infractions.delete(this)
  }
}

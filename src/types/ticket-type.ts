import { BaseStructureArgumentType } from './base'
import { TicketType } from '../structures'
import type { TicketType as TicketTypeEntity } from '../entities'
import { injectable } from 'inversify'

@injectable()
export default class TicketTypeArgumentType extends BaseStructureArgumentType<TicketType, TicketTypeEntity> {
  public constructor () {
    super(TicketType)
  }
}

import { BaseStructureArgumentType } from './base'
import { TicketType } from '../structures'
import { injectable } from 'inversify'

@injectable()
export default class TicketTypeArgumentType extends BaseStructureArgumentType<TicketType> {
  public constructor () {
    super(TicketType)
  }
}

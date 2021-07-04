import BaseArgumentType from './base'
import type { CommandoClient } from 'discord.js-commando'
import { TicketType } from '../structures'

export default class TicketTypeArgumentType extends BaseArgumentType<TicketType> {
  public constructor (client: CommandoClient) {
    super(client, TicketType)
  }
}

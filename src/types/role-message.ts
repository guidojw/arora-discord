import BaseArgumentType from './base'
import type { CommandoClient } from 'discord.js-commando'
import { RoleMessage } from '../structures'

export default class RoleMessageArgumentType extends BaseArgumentType<RoleMessage> {
  public constructor (client: CommandoClient) {
    super(client, RoleMessage)
  }
}

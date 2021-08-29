import BaseArgumentType from './base'
import type { CommandoClient } from 'discord.js-commando'
import { RoleGroup } from '../structures'

export default class RoleGroupArgumentType extends BaseArgumentType<RoleGroup> {
  public constructor (client: CommandoClient) {
    super(client, RoleGroup, 'groups')
  }
}

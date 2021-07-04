import BaseArgumentType from './base'
import type { CommandoClient } from 'discord.js-commando'
import { Group } from '../structures'

export default class GroupArgumentType extends BaseArgumentType<Group> {
  public constructor (client: CommandoClient) {
    super(client, Group)
  }
}

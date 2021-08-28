import BaseArgumentType from './base'
import type { CommandoClient } from 'discord.js-commando'
import { RoleBinding } from '../structures'

export default class RoleBindingArgumentType extends BaseArgumentType<RoleBinding> {
  public constructor (client: CommandoClient) {
    super(client, RoleBinding)
  }
}

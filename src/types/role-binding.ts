import type { Argument, CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseArgumentType from './base'
import { RoleBinding } from '../structures'

export default class RoleBindingArgumentType extends BaseArgumentType<RoleBinding> {
  public constructor (client: CommandoClient) {
    super(client, RoleBinding)
  }

  public override async validate (val: string, msg: CommandoMessage, arg: Argument): Promise<boolean | string> {
    if (typeof msg.guild === 'undefined') {
      return false
    }
    await msg.guild.roleBindings.fetch()
    return await super.validate(val, msg, arg)
  }
}

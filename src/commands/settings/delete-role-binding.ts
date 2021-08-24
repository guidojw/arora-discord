import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import type { RoleBinding } from '../../structures'

export default class DeleteRoleBindingCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'deleterolebinding',
      aliases: ['delrolebinding', 'deleterolebnd', 'delrolebnd'],
      description: 'Deletes a Roblox rank to Discord role binding.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'roleBinding',
        prompt: 'What role binding would you like to delete?',
        type: 'integer'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { roleBinding }: { roleBinding: RoleBinding }
  ): Promise<Message | Message[] | null> {
    await message.guild.roleBindings.delete(roleBinding)

    return await message.reply('Successfully deleted role binding.')
  }
}

import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import type { RoleMessage } from '../../structures'

export default class DeleteRoleMessageCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'deleterolemessage',
      aliases: ['delrolemessage', 'deleterolemsg', 'delrolemsg'],
      description: 'Deletes a role message.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'roleMessage',
        prompt: 'What role message would you like to delete?',
        type: 'integer'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { roleMessage }: { roleMessage: RoleMessage }
  ): Promise<Message | Message[] | null> {
    await message.guild.roleMessages.delete(roleMessage)

    return await message.reply('Successfully deleted role message.')
  }
}

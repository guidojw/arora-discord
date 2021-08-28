import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Group } from '../../structures'
import type { Message } from 'discord.js'

export default class DeleteGroupCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'deletegroup',
      aliases: ['delgroup'],
      description: 'Deletes a group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'group',
        prompt: 'What group would you like to delete?',
        type: 'arora-group'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { group }: { group: Group }
  ): Promise<Message | Message[] | null> {
    await message.guild.groups.delete(group)

    return await message.reply('Successfully deleted group.')
  }
}

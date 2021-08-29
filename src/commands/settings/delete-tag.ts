import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import type { Tag } from '../../structures'

export default class DeleteTagCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'deletetag',
      aliases: ['deltag'],
      description: 'Deletes a tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'tag',
        prompt: 'What tag would you like to delete?',
        type: 'tag'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { tag }: { tag: Tag }
  ): Promise<Message | Message[] | null> {
    await message.guild.tags.delete(tag)

    return await message.reply('Successfully deleted tag.')
  }
}

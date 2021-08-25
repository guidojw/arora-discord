import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import type { Tag } from '../../structures'

export default class RawTagCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'rawtag',
      description: 'Posts the raw content of a tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'tag',
        type: 'tag',
        prompt: 'What tag would you like the raw content of?'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { tag }: { tag: Tag }
  ): Promise<Message | Message[] | null> {
    return await message.reply(
      tag._content,
      { code: true, allowedMentions: { users: [message.author.id] } }
    )
  }
}

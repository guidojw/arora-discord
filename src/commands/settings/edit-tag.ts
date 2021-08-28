import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import type { Tag } from '../../structures'
import { argumentUtil } from '../../util'

const { validators, isObject, typeOf } = argumentUtil

export default class EditTagCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'edittag',
      description: 'Edits a tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'tag',
        prompt: 'What tag would you like to edit?',
        type: 'tag'
      }, {
        key: 'content',
        prompt: 'What do you want the new content of this tag to be?',
        type: 'json-object|string',
        validate: validators([[isObject, typeOf('string')]])
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { tag, content }: {
      tag: Tag
      content: string
    }
  ): Promise<Message | Message[] | null> {
    tag = await message.guild.tags.update(tag, { content })

    return await message.reply(`Successfully edited tag \`${tag.names.cache.first()?.name ?? 'Unknown'}\`.`)
  }
}

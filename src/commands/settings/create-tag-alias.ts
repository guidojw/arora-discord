import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import type { Tag } from '../../structures'
import { argumentUtil } from '../../util'

const { validators, noNumber } = argumentUtil

export default class CreateTagAliasCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'createtagalias',
      aliases: ['createalias'],
      description: 'Creates a new alias for a tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'tag',
        prompt: 'To what tag would you like to add this alias?',
        type: 'tag'
      }, {
        key: 'alias',
        prompt: 'What would you like the new alias of this tag to be?',
        type: 'string',
        validate: validators([noNumber])
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { tag, alias }: {
      tag: Tag
      alias: string
    }
  ): Promise<Message | Message[] | null> {
    const tagName = await tag.names.create(alias)

    return await message.reply(`Successfully created alias \`${tagName.name}\` for tag \`${tag.names.cache.first()?.name ?? 'Unknown'}\`.`)
  }
}

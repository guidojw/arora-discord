import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'

export default class DeleteTagAliasCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'deletetagalias',
      aliases: ['deltagalias', 'deletealias', 'delalias'],
      description: 'Deletes a tag alias.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'alias',
        prompt: 'What tag alias would you like to delete?',
        type: 'string'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { alias }: { alias: string }
  ): Promise<Message | Message[] | null> {
    const tag = message.guild.tags.resolve(alias)
    if (tag === null) {
      return await message.reply('Tag not found')
    }

    await tag.names.delete(alias)

    return await message.reply(`Successfully deleted alias from tag \`${tag.names.cache.first()?.name ?? 'Unknown'}\`.`)
  }
}

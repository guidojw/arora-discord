import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import { discordService } from '../../services'

export default class DeleteSuggestionCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'main',
      name: 'deletesuggestion',
      aliases: ['delsuggestion'],
      description: 'Deletes your last suggested suggestion.',
      clientPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'SEND_MESSAGES']
    })
  }

  public async run (message: CommandoMessage): Promise<Message | Message[] | null> {
    if (message.guild.suggestionsChannel === null) {
      return await message.reply('This server has no suggestionsChannel set yet.')
    }
    const messages = await message.guild.suggestionsChannel.messages.fetch()
    const authorUrl = `https://discord.com/users/${message.author.id}`

    for (const suggestion of messages.values()) {
      if (suggestion.embeds[0]?.author?.url === authorUrl) {
        const prompt = await message.replyEmbed(suggestion.embeds[0], 'Are you sure you would like to delete this ' +
          'suggestion?')
        const choice = (await discordService.prompt(message.author, prompt, ['✅', '🚫']))?.toString() === '✅'

        if (choice) {
          await suggestion.delete()
          return await message.reply('Successfully deleted your last suggestion.')
        } else {
          return await message.reply('Didn\'t delete your last suggestion.')
        }
      }
    }

    return await message.reply('Could not find a suggestion you made.')
  }
}

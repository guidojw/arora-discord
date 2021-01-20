'use strict'
const BaseCommand = require('../base')
const discordService = require('../../services/discord')

class DeleteSuggestionCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'deletesuggestion',
      aliases: ['delete'],
      description: 'Deletes your last suggested suggestion.',
      clientPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'SEND_MESSAGES']
    })
  }

  async run (message) {
    if (!message.guild.suggestionsChannel) {
      return message.reply('This server has no suggestionsChannel set yet.')
    }
    const messages = await message.guild.suggestionsChannel.messages.fetch()
    const authorUrl = `https://discordapp.com/users/${message.author.id}`

    for (const suggestion of messages.values()) {
      if (suggestion.embeds.length === 1 && suggestion.embeds[0].author && suggestion.embeds[0].author.url ===
        authorUrl) {
        const prompt = await message.replyEmbed(suggestion.embeds[0], 'Are you sure would like to delete this' +
          ' suggestion?')
        const choice = await discordService.prompt(message.channel, message.author, prompt, ['✅', '🚫']) ===
          '✅'

        if (choice) {
          await suggestion.delete()
          return message.reply('Successfully deleted your last suggestion.')
        } else {
          return message.reply('Didn\'t delete your last suggestion.')
        }
      }
    }

    return message.reply('Could not find a suggestion you made.')
  }
}

module.exports = DeleteSuggestionCommand

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

  async execute (message, _args, guild) {
    const channels = guild.getData('channels')
    const channel = guild.channels.cache.get(channels.suggestionsChannel)
    const messages = await channel.messages.fetch()
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

import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Message, MessageAttachment } from 'discord.js'
import BaseCommand from '../base'
import { MessageEmbed } from 'discord.js'
import { argumentUtil } from '../../util'

const { validators, noTags } = argumentUtil

export default class SuggestCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'main',
      name: 'suggest',
      description: 'Suggests given suggestion.',
      details: 'Suggestion can be encapsulated in quotes (but this is not necessary).',
      examples: ['suggest Add cool new thing', 'suggest "Add cool new thing"'],
      clientPermissions: ['ADD_REACTIONS', 'SEND_MESSAGES'],
      args: [{
        key: 'suggestion',
        prompt: 'What would you like to suggest?',
        type: 'string',
        validate: validators([noTags])
      }],
      throttling: {
        usages: 1,
        duration: 30 * 60
      }
    })
  }

  public async run (
    message: CommandoMessage,
    { suggestion }: { suggestion: string }
  ): Promise<Message | Message[] | null> {
    if (message.guild.suggestionsChannel === null) {
      return await message.reply('This server has no suggestionsChannel set yet.')
    }
    if (suggestion === '' || /^\s+$/.test(suggestion)) {
      return await message.reply('Cannot suggest empty suggestions.')
    }
    const authorUrl = `https://discord.com/users/${message.author.id}`
    const embed = new MessageEmbed()
      .setDescription(suggestion)
      .setAuthor(message.author.tag, message.author.displayAvatarURL(), authorUrl)
      .setColor(0x000af43)
    if (message.attachments.size > 0) {
      const attachment = message.attachments.first() as MessageAttachment
      if (attachment.height !== null) {
        embed.setImage(attachment.url)
      }
    }

    const newMessage = await message.guild.suggestionsChannel.send({ embeds: [embed] })
    await newMessage.react('⬆️')
    await newMessage.react('⬇️')

    return await message.reply('Successfully suggested', { embed })
  }
}

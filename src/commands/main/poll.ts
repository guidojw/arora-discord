import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import applicationConfig from '../../configs/application'
import { argumentUtil } from '../../util'

const { validators, noTags } = argumentUtil

export default class PollCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'main',
      name: 'poll',
      details: 'Use (X) with X being a number from 1-10 in your poll to have the bot automatically react the emojis ' +
        'of these numbers on the poll. If not provided, the bot will react with a checkmark and crossmark.',
      description: 'Posts a poll of given poll to the current channel.',
      examples: ['poll Dogs (1) or cats (2)?'],
      clientPermissions: ['ADD_REACTIONS', 'SEND_MESSAGES'],
      args: [{
        key: 'poll',
        type: 'string',
        prompt: 'What would you like the question to be?',
        validate: validators([noTags])
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { poll }: { poll: string }
  ): Promise<Message | Message[] | null> {
    const options = []
    for (let num = 1; num <= 10; num++) {
      if (message.content.includes(`(${num})`)) {
        options.push(num)
      }
    }
    const embed = new MessageEmbed()
      .setDescription(poll)
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setColor(message.guild.primaryColor ?? applicationConfig.defaultColor)

    const newMessage = await message.channel.send(embed)
    if (options.length > 0) {
      for (const option of options) {
        await newMessage.react(`${option}⃣`)
      }
    } else {
      await newMessage.react('✔')
      await newMessage.react('✖')
    }
    return null
  }
}
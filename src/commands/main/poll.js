'use strict'

const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { validators, noTags } = require('../../util').argumentUtil

class PollCommand extends BaseCommand {
  constructor (client) {
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

  async run (message, { poll }) {
    const options = []
    for (let num = 1; num <= 10; num++) {
      if (message.content.indexOf(`(${num})`) !== -1) {
        options.push(num)
      }
    }
    const embed = new MessageEmbed()
      .setDescription(poll)
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setColor(message.guild.primaryColor)

    const newMessage = await message.channel.send(embed)
    if (options.length > 0) {
      for (const option of options) {
        await newMessage.react(`${option}⃣`)
      }
    } else {
      await newMessage.react('✔')
      await newMessage.react('✖')
    }
  }
}

module.exports = PollCommand

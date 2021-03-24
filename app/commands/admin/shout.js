'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { applicationAdapter } = require('../../adapters')
const { userService } = require('../../services')
const { argumentUtil } = require('../../util')
const { validators, noChannels, noTags, noUrls } = argumentUtil

class ShoutCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'shout',
      details: 'Shout can be either a message or "clear". When it\'s clear, the group shout will be cleared.',
      description: 'Posts shout with given shout to the group.',
      examples: ['shout Happywalker is awesome', 'shout "Happywalker is awesome"', 'shout clear'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresRobloxGroup: true,
      args: [{
        key: 'body',
        type: 'string',
        prompt: 'What would you like to shout?',
        max: 255,
        validate: validators([noChannels, noTags, noUrls])
      }]
    })
  }

  async run (message, { body }, guild) {
    const authorId = await userService.getIdFromUsername(message.member.displayName)

    const shout = (await applicationAdapter('post', `/v1/groups/${message.guild.robloxGroupId}/shout`, {
      message: body === 'clear' ? '' : body,
      authorId
    })).data

    if (shout.body === '') {
      return message.reply('Successfully cleared shout.')
    } else {
      const embed = new MessageEmbed()
        .addField('Successfully shouted', shout.body)
        .setColor(message.guild.primaryColor)
      return message.replyEmbed(embed)
    }
  }
}

module.exports = ShoutCommand

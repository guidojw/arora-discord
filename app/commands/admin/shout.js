'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')
const { MessageEmbed } = require('discord.js')
const { getChannels, getTags, getUrls } = require('../../helpers/string')

const applicationConfig = require('../../../config/application')

module.exports = class ShoutCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'shout',
      details: 'Shout can be either a message or "clear". When it\'s clear, the group shout will be cleared.',
      description: 'Posts shout with given shout to the group.',
      examples: ['shout Happywalker is awesome', 'shout "Happywalker is awesome"', 'shout clear'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'body',
        type: 'string',
        prompt: 'What would you like to shout?',
        validate: val => val.length > 255
          ? 'Shout is too long.'
          : getChannels(val)
            ? 'Shout contains channels.'
            : getTags(val)
              ? 'Shout contains tags.'
              : getUrls(val)
                ? 'Shout contains URLs.'
                : true
      }]
    })
  }

  async execute (message, { body }, guild) {
    const authorId = await userService.getIdFromUsername(message.member.displayName)

    const shout = (await applicationAdapter('post', `/v1/groups/${applicationConfig.groupId}/shout`, {
      message: body === 'clear' ? '' : body,
      authorId
    })).data

    if (shout.body === '') {
      message.reply('Successfully cleared shout.')
    } else {
      const embed = new MessageEmbed()
        .addField('Successfully shouted', shout.body)
        .setColor(guild.getData('primaryColor'))
      message.replyEmbed(embed)
    }
  }
}

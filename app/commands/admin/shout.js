'use strict'
const applicationAdapter = require('../../adapters/application')
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { stringHelper } = require('../../helpers')
const { userService } = require('../../services')

class ShoutCommand extends BaseCommand {
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
          : stringHelper.getChannels(val)
            ? 'Shout contains channels.'
            : stringHelper.getTags(val)
              ? 'Shout contains tags.'
              : stringHelper.getUrls(val)
                ? 'Shout contains URLs.'
                : true
      }]
    })
  }

  async run (message, { body }, guild) {
    if (message.guild.robloxGroupId === null) {
      return message.reply('This server is not bound to a Roblox group yet.')
    }
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

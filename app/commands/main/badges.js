'use strict'
const Base = require('../base')

const { MessageEmbed } = require('discord.js')
const { userService } = require('../../services')

const TTDT_ID = 912438803
const PTDT_ID = 496942494
const TCCT_ID = 2124496060

class BadgesCommand extends Base {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'badges',
      description: 'Checks if given user/you has the training badges.',
      examples: ['badges', 'badges Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Whose badges would you like to check?',
        default: message => message.member.displayName
      }]
    })
  }

  async run (message, { username }) {
    username = typeof username === 'string' ? username : username.displayName
    const userId = await userService.getIdFromUsername(username)
    const hasTtdt = await userService.hasBadge(userId, TTDT_ID)
    const hasPtdt = await userService.hasBadge(userId, PTDT_ID)
    const hasTcct = await userService.hasBadge(userId, TCCT_ID)

    const embed = new MessageEmbed()
      .setTitle(`${message.argString ? username + '\'s' : 'Your'} badges`)
      .addField('TTDT', hasTtdt ? 'yes' : 'no', true)
      .addField('PTDT', hasPtdt ? 'yes' : 'no', true)
      .addField('TCCT', hasTcct ? 'yes' : 'no', true)
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = BadgesCommand

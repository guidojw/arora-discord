'use strict'

const Base = require('../base')

const { MessageEmbed } = require('discord.js')
const { userService } = require('../../services')

const TTDT_ID = 912438803
const PTDT_ID = 496942494
const TCDT_ID = 2124496060

class BadgesCommand extends Base {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'badges',
      description: 'Checks if given user/you has the training badges.',
      examples: ['badges', 'badges Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Whose badges would you like to check?',
        default: 'self'
      }]
    })
  }

  async run (message, { user }) {
    const { id: userId, username } = user
    const hasTtdt = await userService.hasBadge(userId, TTDT_ID)
    const hasPtdt = await userService.hasBadge(userId, PTDT_ID)
    const hasTcdt = await userService.hasBadge(userId, TCDT_ID)

    const embed = new MessageEmbed()
      .setTitle(`${username ?? userId}'s badges`)
      .addField('TTDT', hasTtdt ? 'yes' : 'no', true)
      .addField('PTDT', hasPtdt ? 'yes' : 'no', true)
      .addField('TCDT', hasTcdt ? 'yes' : 'no', true)
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = BadgesCommand

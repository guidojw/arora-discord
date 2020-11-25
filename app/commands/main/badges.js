'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')

const { MessageEmbed } = require('discord.js')

const TTDT_ID = 912438803
const PTDT_ID = 496942494
const TCDT_ID = 2124496060

module.exports = class BadgesCommand extends Command {
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
        prompt: 'Of who would you like to know the suspend reason?',
        default: ''
      }]
    })
  }

  async execute (message, { username }, guild) {
    username = username ? typeof username === 'string' ? username : username.displayName : message.member.displayName
    const userId = await userService.getIdFromUsername(username)
    const hasTtdt = await userService.hasBadge(userId, TTDT_ID)
    const hasPtdt = await userService.hasBadge(userId, PTDT_ID)
    const hasTcdt = await userService.hasBadge(userId, TCDT_ID)

    const embed = new MessageEmbed()
      .setTitle(`${message.argString ? username + '\'s' : 'Your'} badges`)
      .addField('TTDT', hasTtdt ? 'yes' : 'no', true)
      .addField('PTDT', hasPtdt ? 'yes' : 'no', true)
      .addField('TCDT', hasTcdt ? 'yes' : 'no', true)
      .setColor(guild.getData('primaryColor'))
    message.replyEmbed(embed)
  }
}

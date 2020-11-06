'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const timeHelper = require('../../helpers/time')
const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

module.exports = class JoinDateCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'joindate',
      description: 'Posts the join date of given user/you.',
      examples: ['joindate', 'joindate Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        prompt: 'Of which user would you like to know the join date?',
        default: '',
        type: 'member|string'
      }]
    })
  }

  async execute (message, { username }) {
    username = username ? typeof username === 'string' ? username : username.displayName : message.member.displayName
    const userId = await userService.getIdFromUsername(username)
    const user = await userService.getUser(userId)
    const embed = new MessageEmbed()
      .addField(`${message.argString ? username : 'Your'} join date`, `${timeHelper.getDate(new Date(user.created))}`)
      .setColor(applicationConfig.primaryColor)
    message.replyEmbed(embed)
  }
}

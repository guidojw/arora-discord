'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { timeHelper } = require('../../helpers')
const { userService } = require('../../services')

class JoinDateCommand extends BaseCommand {
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

  async run (message, { username }) {
    username = username ? typeof username === 'string' ? username : username.displayName : message.member.displayName
    const userId = await userService.getIdFromUsername(username)
    const user = await userService.getUser(userId)

    const embed = new MessageEmbed()
      .addField(`${message.argString ? username : 'Your'} join date`, `${timeHelper.getDate(new Date(user.created))}`)
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = JoinDateCommand

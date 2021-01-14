'use strict'
const BaseCommand = require('../base')
const userService = require('../../services/user')

const { MessageEmbed } = require('discord.js')

class UserIdCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'userid',
      aliases: ['getuserid'],
      description: 'Posts the user ID of given user/you.',
      examples: ['userid', 'userid Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        prompt: 'Of which user would you like to know the user ID?',
        default: '',
        type: 'member|string'
      }]
    })
  }

  async run (message, { username }) {
    username = username ? typeof username === 'string' ? username : username.displayName : message.member.displayName
    const userId = await userService.getIdFromUsername(username)

    const embed = new MessageEmbed()
      .addField(`${message.argString ? username + '\'s' : 'Your'} user ID`, userId)
      .setColor(message.guild.getData('primaryColor'))
    return message.replyEmbed(embed)
  }
}

module.exports = UserIdCommand

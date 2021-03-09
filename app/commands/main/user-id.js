'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { userService } = require('../../services')

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
        type: 'member|string',
        default: message => message.member.displayName
      }]
    })
  }

  async run (message, { username }) {
    username = typeof username === 'string' ? username : username.displayName
    const userId = await userService.getIdFromUsername(username)

    const embed = new MessageEmbed()
      .addField(`${message.argString ? `${username}'s` : 'Your'} user ID`, userId)
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = UserIdCommand

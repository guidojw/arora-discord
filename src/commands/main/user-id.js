'use strict'

const BaseCommand = require('../base')

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
        key: 'user',
        prompt: 'Of which user would you like to know the user ID?',
        type: 'roblox-user',
        default: 'self'
      }]
    })
  }

  run (message, { user }) {
    const embed = new MessageEmbed()
      .addField(`${user.username ?? user.id}'s user ID`, user.id)
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = UserIdCommand

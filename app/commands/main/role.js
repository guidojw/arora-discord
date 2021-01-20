'use strict'
const Base = require('../base')
const userService = require('../../services/user')

const { MessageEmbed } = require('discord.js')

class RoleCommand extends Base {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'role',
      aliases: ['getrole'],
      description: 'Posts the group role of given user/you.',
      examples: ['role', 'role Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Of which user would you like to know the group role?',
        default: ''
      }]
    })
  }

  async run (message, { username }) {
    if (message.guild.robloxGroupId === null) {
      return message.reply('This server is not bound to a Roblox group yet.')
    }
    username = username ? typeof username === 'string' ? username : username.displayName : message.member.displayName
    const userId = await userService.getIdFromUsername(username)
    const role = await userService.getRole(userId, message.guild.robloxGroupId)

    const embed = new MessageEmbed()
      .addField(`${message.argString ? username + '\'s' : 'Your'} role`, role)
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = RoleCommand

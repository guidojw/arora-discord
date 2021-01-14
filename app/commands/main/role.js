'use strict'
const Base = require('../base')
const userService = require('../../services/user')

const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

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
    username = username ? typeof username === 'string' ? username : username.displayName : message.member.displayName
    const userId = await userService.getIdFromUsername(username)
    const role = await userService.getRole(userId, applicationConfig.groupId)

    const embed = new MessageEmbed()
      .addField(`${message.argString ? username + '\'s' : 'Your'} role`, role)
      .setColor(message.guild.getData('primaryColor'))
    return message.replyEmbed(embed)
  }
}

module.exports = RoleCommand

'use strict'

const Base = require('../base')

const { MessageEmbed } = require('discord.js')
const { userService } = require('../../services')

class RoleCommand extends Base {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'role',
      aliases: ['getrole'],
      description: 'Posts the group role of given user/you.',
      examples: ['role', 'role Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Of which user would you like to know the group role?',
        default: 'self'
      }]
    })
  }

  async run (message, { user }) {
    const role = await userService.getRole(user.id, message.guild.robloxGroupId)
    const embed = new MessageEmbed()
      .addField(`${user.username ?? user.id}'s role`, role)
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = RoleCommand

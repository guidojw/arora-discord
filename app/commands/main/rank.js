'use strict'

const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { userService } = require('../../services')

class RankCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'rank',
      aliases: ['getrank'],
      description: 'Posts the group rank of given user/you.',
      examples: ['rank', 'rank Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Of which user would you like to know the group rank?',
        default: message => message.member.displayName
      }]
    })
  }

  async run (message, { username }) {
    username = typeof username === 'string' ? username : username.displayName
    const userId = await userService.getIdFromUsername(username)
    const rank = await userService.getRank(userId, message.guild.robloxGroupId)

    const embed = new MessageEmbed()
      .addField(`${message.argString ? `${username}'s` : 'Your'} rank`, rank)
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = RankCommand

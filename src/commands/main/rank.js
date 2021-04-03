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
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Of which user would you like to know the group rank?',
        default: 'self'
      }]
    })
  }

  async run (message, { user }) {
    const rank = await userService.getRank(user.id, message.guild.robloxGroupId)
    const embed = new MessageEmbed()
      .addField(`${user.username ?? user.id}'s rank`, rank)
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = RankCommand

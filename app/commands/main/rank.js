'use strict'
const BaseCommand = require('../base')
const userService = require('../../services/user')

const { MessageEmbed } = require('discord.js')

class RankCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'rank',
      aliases: ['getrank'],
      description: 'Posts the group rank of given user/you.',
      examples: ['rank', 'rank Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Of which user would you like to know the group rank?',
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
    const rank = await userService.getRank(userId, message.guild.robloxGroupId)

    const embed = new MessageEmbed()
      .addField(`${message.argString ? username + '\'s' : 'Your'} rank`, rank)
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = RankCommand

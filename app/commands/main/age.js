'use strict'

const pluralize = require('pluralize')
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { userService } = require('../../services')

class AgeCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'age',
      aliases: ['accountage'],
      description: 'Posts the age of given user/you.',
      examples: ['age', 'age Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      args: [{
        key: 'user',
        prompt: 'Of which user would you like to know the age?',
        type: 'roblox-user',
        default: 'self'
      }]
    })
  }

  async run (message, { user }) {
    user = await userService.getUser(user.id)
    const age = Math.floor((Date.now() - new Date(user.created).getTime()) / 86400000)

    const embed = new MessageEmbed()
      .addField(`${user.name}'s age`, pluralize('day', age, true))
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = AgeCommand

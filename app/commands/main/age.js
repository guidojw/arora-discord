'use strict'
const pluralize = require('pluralize')
const BaseCommand = require('../base')
const userService = require('../../services/user')

const { MessageEmbed } = require('discord.js')

class AgeCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'age',
      aliases: ['accountage'],
      description: 'Posts the age of given user/you.',
      examples: ['age', 'age Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        prompt: 'Of which user would you like to know the age?',
        default: '',
        type: 'member|string'
      }]
    })
  }

  async execute (message, { username }, guild) {
    username = username ? typeof username === 'string' ? username : username.displayName : message.member.displayName
    const userId = await userService.getIdFromUsername(username)
    const user = await userService.getUser(userId)
    const age = Math.floor((Date.now() - new Date(user.created).getTime()) / 86400000)

    const embed = new MessageEmbed()
      .addField(`${message.argString ? username + '\'s' : 'Your'} age`, `${age} ${pluralize('day', age)}`)
      .setColor(guild.getData('primaryColor'))
    return message.replyEmbed(embed)
  }
}

module.exports = AgeCommand

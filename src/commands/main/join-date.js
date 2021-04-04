'use strict'

const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { userService } = require('../../services')
const { getDate } = require('../../util').timeUtil

class JoinDateCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'joindate',
      description: 'Posts the join date of given user/you.',
      examples: ['joindate', 'joindate Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'user',
        prompt: 'Of which user would you like to know the join date?',
        type: 'roblox-user',
        default: 'self'
      }]
    })
  }

  async run (message, { user }) {
    user = await userService.getUser(user.id)

    const embed = new MessageEmbed()
      .addField(`${user.name}'s join date`, `${getDate(new Date(user.created))}`)
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = JoinDateCommand

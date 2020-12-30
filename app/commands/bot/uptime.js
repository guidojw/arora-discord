'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { getDurationString } = require('../../helpers/time')

class UptimeCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'bot',
      name: 'uptime',
      description: 'Posts the bot\'s uptime.',
      clientPermissions: ['SEND_MESSAGES']
    })
  }

  execute (message, _args, guild) {
    const embed = new MessageEmbed()
      .addField('I have been online for', getDurationString(this.client.uptime))
      .setColor(guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = UptimeCommand

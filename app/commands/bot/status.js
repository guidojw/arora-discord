'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')

class StatusCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'bot',
      name: 'status',
      description: 'Posts the bot\'s systems\' statuses.',
      clientPermissions: ['SEND_MESSAGES']
    })
  }

  run (message) {
    const embed = new MessageEmbed()
      .setColor(message.guild.supportEnabled ? 0x00ff00 : 0xff0000)
      .setTitle('Status')
      .setDescription(`Tickets System: **${message.guild.supportEnabled ? 'online' : 'offline'}**`)
      .setTimestamp()
    return message.replyEmbed(embed)
  }
}

module.exports = StatusCommand

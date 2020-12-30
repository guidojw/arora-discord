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

  execute (message, _args, guild) {
    const embed = new MessageEmbed()
      .setColor(guild.supportEnabled ? 0x00ff00 : 0xff0000)
      .setTitle('Status')
      .setDescription(`Tickets System: **${guild.supportEnabled ? 'online' : 'offline'}**`)
      .setTimestamp()
    return message.replyEmbed(embed)
  }
}

module.exports = StatusCommand

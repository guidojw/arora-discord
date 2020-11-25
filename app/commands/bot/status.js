'use strict'
const Command = require('../../controllers/command')

const { MessageEmbed } = require('discord.js')

module.exports = class StatusCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'bot',
      name: 'status',
      description: 'Posts the bot\'s systems\' statuses.',
      clientPermissions: ['SEND_MESSAGES']
    })
  }

  execute (message, _args, guild) {
    const settings = guild.getData('settings')

    const embed = new MessageEmbed()
      .setColor(settings.supportEnabled ? 0x00ff00 : 0xff0000)
      .setTitle('Status')
      .setDescription(`Tickets System: **${settings.supportEnabled ? 'online' : 'offline'}**`)
      .setTimestamp()
    message.replyEmbed(embed)
  }
}

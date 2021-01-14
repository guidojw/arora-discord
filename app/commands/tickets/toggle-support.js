'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')

class ToggleSupportCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'tickets',
      name: 'togglesupport',
      aliases: ['toggle'],
      description: 'Enables/disables the support system.',
      clientPermissions: ['SEND_MESSAGES']
    })
  }

  async execute (message, _args, guild) {
    await guild.update({ supportEnabled: !guild.supportEnabled })

    const embed = new MessageEmbed()
      .setColor(guild.supportEnabled ? 0x00ff00 : 0xff0000)
      .setTitle('Successfully toggled support')
      .setDescription(`Tickets System: **${guild.supportEnabled ? 'online' : 'offline'}**`)
    return message.replyEmbed(embed)
  }
}

module.exports = ToggleSupportCommand

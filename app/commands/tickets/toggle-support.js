'use strict'
const Command = require('../../controllers/command')

const { MessageEmbed } = require('discord.js')

module.exports = class ToggleSupportCommand extends Command {
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
    // Toggle the setting
    await guild.edit({ supportEnabled: !guild.supportEnabled })

    // Send success message
    const embed = new MessageEmbed()
      .setColor(guild.supportEnabled ? 0x00ff00 : 0xff0000)
      .setTitle('Successfully toggled support')
      .setDescription(`Tickets System: **${guild.supportEnabled ? 'online' : 'offline'}**`)
    return message.replyEmbed(embed)
  }
}

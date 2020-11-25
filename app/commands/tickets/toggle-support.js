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

  execute (message, _args, guild) {
    // Toggle the setting
    const settings = guild.getData('settings')

    settings.supportEnabled = !settings.supportEnabled
    guild.setData('settings', settings)

    // Send success message
    const embed = new MessageEmbed()
      .setColor(settings.supportEnabled ? 0x00ff00 : 0xff0000)
      .setTitle('Successfully toggled support')
      .setDescription(`Tickets System: **${settings.supportEnabled ? 'online' : 'offline'}**`)
    return message.replyEmbed(embed)
  }
}

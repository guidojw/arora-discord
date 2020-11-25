'use strict'
const Command = require('../../controllers/command')

const { MessageEmbed } = require('discord.js')
const { getDurationString } = require('../../helpers/time')

module.exports = class UptimeCommand extends Command {
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
      .addField('NSadmin has been online for', getDurationString(this.client.uptime))
      .setColor(guild.getData('primaryColor'))
    message.replyEmbed(embed)
  }
}

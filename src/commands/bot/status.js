'use strict'

const os = require('os')
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { getDurationString } = require('../../util').timeUtil
const { formatBytes } = require('../../util').util

class StatusCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'bot',
      name: 'status',
      aliases: ['stats'],
      description: 'Posts the system statuses.',
      clientPermissions: ['SEND_MESSAGES']
    })
  }

  run (message) {
    const embed = new MessageEmbed()
      .setColor(0xff82d1)
      .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
      .addField('System Statuses', `Tickets System: **${message.guild.supportEnabled ? 'online' : 'offline'}**`)
      .addField('Load Average', os.loadavg().join(', '), true)
      .addField('Memory Usage', `${formatBytes(os.freemem(), 3)} / ${formatBytes(os.totalmem(), 3)}`, true)
      .addField('Uptime', getDurationString(this.client.uptime), true)
      .setFooter(`Process ID: ${process.pid} | ${os.hostname()}`)
      .setTimestamp()
    return message.replyEmbed(embed)
  }
}

module.exports = StatusCommand

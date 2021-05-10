'use strict'

const os = require('os')
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { applicationAdapter } = require('../../adapters')
const { getDurationString } = require('../../util').timeUtil
const { formatBytes } = require('../../util').util

const applicationConfig = require('../../../config/application')

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

  async run (message) {
    const embed = new MessageEmbed()
      .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
      .setColor(0xff82d1)
    if (message.guild) {
      embed.addField('System Statuses', `Tickets System: **${message.guild.supportEnabled ? 'online' : 'offline'}**`)
    }
    const totalMem = os.totalmem()
    embed
      .addField('Load Average', os.loadavg().join(', '), true)
      .addField('Memory Usage', `${formatBytes(totalMem - os.freemem(), 3)} / ${formatBytes(totalMem, 3)}`, true)
      .addField('Uptime', getDurationString(this.client.uptime), true)
      .setFooter(`Process ID: ${process.pid} | ${os.hostname()}`)
      .setTimestamp()
    if (applicationConfig.apiEnabled) {
      const startTime = Date.now()
      const status = (await applicationAdapter('GET', 'v1/status')).data
      const endTime = Date.now()
      embed
        .addField('API Latency', (endTime - startTime) + 'ms', true)
        .addField('API Status', status.state, true)
    }
    return message.replyEmbed(embed)
  }
}

module.exports = StatusCommand

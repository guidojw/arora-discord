import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import { timeUtil, util } from '../../util'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import { applicationAdapter } from '../../adapters'
import applicationConfig from '../../configs/application'
import os from 'node:os'

const { formatBytes } = util
const { getDurationString } = timeUtil

export default class StatusCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'bot',
      name: 'status',
      aliases: ['stats'],
      description: 'Posts the system statuses.',
      clientPermissions: ['SEND_MESSAGES']
    })
  }

  public async run (message: CommandoMessage): Promise<Message | Message[] | null> {
    const embed = new MessageEmbed()
      .setAuthor(this.client.user?.username ?? 'Arora', this.client.user?.displayAvatarURL())
      .setColor(0xff82d1)
    if (message.guild !== null) {
      embed.addField('System Statuses', `Tickets System: **${message.guild.supportEnabled ? 'online' : 'offline'}**`)
    }
    const totalMem = os.totalmem()
    embed
      .addField('Load Average', os.loadavg().join(', '), true)
      .addField('Memory Usage', `${formatBytes(totalMem - os.freemem(), 3)} / ${formatBytes(totalMem, 3)}`, true)
      .addField('Uptime', getDurationString(this.client.uptime ?? 0), true)
      .setFooter(`Process ID: ${process.pid} | ${os.hostname()}`)
      .setTimestamp()
    if (applicationConfig.apiEnabled === true) {
      const startTime = Date.now()
      const status = (await applicationAdapter('GET', 'v1/status')).data
      const endTime = Date.now()
      embed
        .addField('API Latency', `${endTime - startTime}ms`, true)
        .addField('API Status', status.state, true)
    }
    return await message.replyEmbed(embed)
  }
}

import { type CommandInteraction, MessageEmbed } from 'discord.js'
import { constants, timeUtil, util } from '../../utils'
import { inject, injectable, named } from 'inversify'
import { Command } from '../base'
import type { GuildContext } from '../../structures'
import type { GuildContextManager } from '../../managers'
import { applicationAdapter } from '../../adapters'
import applicationConfig from '../../configs/application'
import os from 'node:os'

const { TYPES } = constants
const { formatBytes } = util
const { getDurationString } = timeUtil

@injectable()
export default class StatusCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (interaction: CommandInteraction): Promise<void> {
    const embed = new MessageEmbed()
      .setAuthor({
        name: interaction.client.user?.username ?? 'Arora',
        iconURL: interaction.client.user?.displayAvatarURL()
      })
      .setColor(0xff82d1)

    if (interaction.inGuild()) {
      const context = this.guildContexts.resolve(interaction.guildId) as GuildContext
      embed.addField('System Statuses', `Tickets System: **${context.supportEnabled ? 'online' : 'offline'}**`)
    }

    const totalMem = os.totalmem()
    embed
      .addField('Load Average', os.loadavg().join(', '), true)
      .addField('Memory Usage', `${formatBytes(totalMem - os.freemem(), 3)} / ${formatBytes(totalMem, 3)}`, true)
      .addField('Uptime', getDurationString(interaction.client.uptime ?? 0), true)
      .setFooter({ text: `Process ID: ${process.pid} | ${os.hostname()}` })
      .setTimestamp()

    if (applicationConfig.apiEnabled === true) {
      const startTime = Date.now()
      const status = (await applicationAdapter('GET', 'v1/status')).data
      const endTime = Date.now()
      embed
        .addField('API Latency', `${endTime - startTime}ms`, true)
        .addField('API Status', status.state, true)
    }

    return await interaction.reply({ embeds: [embed] })
  }
}

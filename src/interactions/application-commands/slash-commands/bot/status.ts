import { type ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import { constants, timeUtil, util } from '../../../../utils'
import { inject, injectable, named } from 'inversify'
import { Command } from '../base'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import { applicationAdapter } from '../../../../adapters'
import applicationConfig from '../../../../configs/application'
import os from 'node:os'

const { TYPES } = constants
const { formatBytes } = util
const { getDurationString } = timeUtil

@injectable()
export default class StatusCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.client.user?.username ?? 'Arora',
        iconURL: interaction.client.user?.displayAvatarURL()
      })
      .setColor(0xff82d1)

    if (interaction.inGuild()) {
      const context = this.guildContexts.resolve(interaction.guildId) as GuildContext
      embed.addFields([
        { name: 'System Statuses', value: `Tickets System: **${context.supportEnabled ? 'online' : 'offline'}**` }
      ])
    }

    const totalMem = os.totalmem()
    embed
      .addFields([
        { name: 'Load Average', value: os.loadavg().join(', '), inline: true },
        {
          name: 'Memory Usage',
          value: `${formatBytes(totalMem - os.freemem(), 3)} / ${formatBytes(totalMem, 3)}`,
          inline: true
        },
        { name: 'Uptime', value: getDurationString(interaction.client.uptime ?? 0), inline: true }
      ])
      .setFooter({ text: `Process ID: ${process.pid} | ${os.hostname()}` })
      .setTimestamp()

    if (applicationConfig.apiEnabled === true) {
      const startTime = Date.now()
      const status = (await applicationAdapter('GET', 'v1/status')).data
      const endTime = Date.now()
      embed.addFields([
        { name: 'API Latency', value: `${endTime - startTime}ms`, inline: true },
        { name: 'API Status', value: status.state, inline: true }
      ])
    }

    await interaction.reply({ embeds: [embed] })
  }
}

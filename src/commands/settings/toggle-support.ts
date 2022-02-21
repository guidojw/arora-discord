import { type CommandInteraction, MessageEmbed } from 'discord.js'
import { Command } from '../base'
import type { GuildContext } from '../../structures'
import { injectable } from 'inversify'

@injectable()
export default class ToggleSupportCommand extends Command {
  public async execute (interaction: CommandInteraction): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext

    await context.update({ supportEnabled: !context.supportEnabled })

    const embed = new MessageEmbed()
      .setColor(context.supportEnabled ? 0x00ff00 : 0xff0000)
      .setTitle('Successfully toggled support')
      .setDescription(`Tickets System: **${context.supportEnabled ? 'online' : 'offline'}**`)
    return await interaction.reply({ embeds: [embed] })
  }
}

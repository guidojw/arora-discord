import BaseCommand from '../base'
import type { CommandInteraction } from 'discord.js'

export default class RestartCommand implements BaseCommand {
  public ownerOnly = true

  public async execute (interaction: CommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Restarting...', ephemeral: true })
    process.exit()
  }
}

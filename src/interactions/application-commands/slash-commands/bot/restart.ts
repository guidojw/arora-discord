import { Command, type CommandOptions } from '../base'
import { ApplyOptions } from '../../../../utils/decorators'
import type { CommandInteraction } from 'discord.js'
import { injectable } from 'inversify'

@injectable()
@ApplyOptions<CommandOptions>({
  ownerOwnly: true
})
export default class RestartCommand extends Command {
  public async execute (interaction: CommandInteraction): Promise<void> {
    await interaction.reply('Restarting...')
    process.exit()
  }
}

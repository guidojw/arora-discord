import { ApplyOptions } from '../../util/decorators'
import { Command } from '../base'
import type { CommandInteraction } from 'discord.js'
import type { CommandOptions } from '../base'
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

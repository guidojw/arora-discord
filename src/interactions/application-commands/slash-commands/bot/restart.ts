import { ApplyOptions } from '../../../../utils/decorators'
import type { ChatInputCommandInteraction } from 'discord.js'
import { Command } from '../base'
import type { CommandOptions } from '..'
import { injectable } from 'inversify'

@injectable()
@ApplyOptions<CommandOptions>({
  ownerOwnly: true
})
export default class RestartCommand extends Command {
  public async execute (interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('Restarting...')
    process.exit()
  }
}

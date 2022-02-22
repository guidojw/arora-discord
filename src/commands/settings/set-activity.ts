import type { ActivityType, CommandInteraction } from 'discord.js'
import { Command, type CommandOptions } from '../base'
import { ApplyOptions } from '../../utils/decorators'
import { argumentUtil } from '../../utils'
import { injectable } from 'inversify'

const { urlRegex } = argumentUtil

const endUrlRegex = new RegExp(`(?:\\s*)${urlRegex.toString().slice(1, -3)}$`, 'i')

@injectable()
@ApplyOptions<CommandOptions>({
  requiresSingleGuild: true,
  command: {
    args: [
      { key: 'name', required: false },
      {
        key: 'type',
        parse: (val: string) => val.toUpperCase(),
        required: false
      }
    ]
  }
})
export default class SetActivityCommand extends Command {
  public async execute (
    interaction: CommandInteraction,
    { name, type }: { name: string | null, type: Exclude<ActivityType, 'CUSTOM'> | null }
  ): Promise<void> {
    if (name === null || type === null) {
      await this.client.startActivityCarousel()

      return await interaction.reply('Successfully set activity back to default.')
    } else {
      const options: { type: Exclude<ActivityType, 'CUSTOM'>, url?: string } = { type }
      if (type === 'STREAMING') {
        const match = name.match(endUrlRegex)
        if (match === null) {
          return await interaction.reply('No URL specified.')
        }
        name = name.replace(endUrlRegex, '')
        if (name === '') {
          return await interaction.reply('Name cannot be empty.')
        }
        options.url = match[1]
      }

      this.client.stopActivityCarousel()
      await this.client.user?.setActivity(name, options)

      return await interaction.reply(`Successfully set activity to \`${type} ${name}\`.`)
    }
  }
}

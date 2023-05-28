import type { ActivityType, ChatInputCommandInteraction } from 'discord.js'
import { ApplyOptions } from '../../../../utils/decorators'
import { Command } from '../base'
import type { CommandOptions } from '..'
import { argumentUtil } from '../../../../utils'
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
    interaction: ChatInputCommandInteraction,
    { name, type }: { name: string | null, type: Exclude<ActivityType, 'CUSTOM'> | null }
  ): Promise<void> {
    if (name === null || type === null) {
      this.client.startActivityCarousel()

      await interaction.reply('Successfully set activity back to default.')
    } else {
      const options: { type: Exclude<ActivityType, 'CUSTOM'>, url?: string } = { type }
      if (type === 'STREAMING') {
        const match = name.match(endUrlRegex)
        if (match === null) {
          await interaction.reply('No URL specified.')
          return
        }
        name = name.replace(endUrlRegex, '')
        if (name === '') {
          await interaction.reply('Name cannot be empty.')
          return
        }
        options.url = match[1]
      }

      this.client.stopActivityCarousel()
      this.client.user?.setActivity(name, options)

      await interaction.reply(`Successfully set activity to \`${type} ${name}\`.`)
    }
  }
}

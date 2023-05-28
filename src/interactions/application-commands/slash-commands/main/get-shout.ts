import { type CommandInteraction, EmbedBuilder } from 'discord.js'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { Command } from '../base'
import type { CommandOptions } from '..'
import type { GetGroupStatus } from '../../../../services/group'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import { applicationAdapter } from '../../../../adapters'
import applicationConfig from '../../../../configs/application'
import { constants } from '../../../../utils'

const { TYPES } = constants

@injectable()
@ApplyOptions<CommandOptions>({
  requiresApi: true,
  requiresRobloxGroup: true
})
export default class GetShoutCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (interaction: CommandInteraction<'raw' | 'cached'>): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    const shout: GetGroupStatus | '' = (await applicationAdapter('GET', `v1/groups/${context.robloxGroupId}/status`)).data

    if (shout !== '' && shout.body !== '') {
      const embed = new EmbedBuilder()
        .addFields([{ name: `Current shout by ${shout.poster.username}`, value: shout.body }])
        .setTimestamp(new Date(shout.updated))
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      await interaction.reply({ embeds: [embed] })
    } else {
      await interaction.reply('There currently is no shout.')
    }
  }
}

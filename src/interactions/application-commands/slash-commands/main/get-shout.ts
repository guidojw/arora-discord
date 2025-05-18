import { type ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { Command } from '../base'
import type { CommandOptions } from '..'
import type { GroupShout } from '../../../../services/group'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import { applicationAdapter } from '../../../../adapters'
import applicationConfig from '../../../../configs/application'
import { constants } from '../../../../utils'
import { userService } from '../../../../services'

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

  public async execute (interaction: ChatInputCommandInteraction<'raw' | 'cached'>): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    const shout: GroupShout = (await applicationAdapter('GET', `v2/groups/${context.robloxGroupId}/shout`)).data

    if (shout.content !== '') {
      const userId = Number(shout.poster.split('/')[1])
      const username = await userService.getUsername(userId)
      const embed = new EmbedBuilder()
        .addFields([{ name: `Current shout by ${username}`, value: shout.content }])
        .setTimestamp(new Date(shout.updateTime))
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      await interaction.reply({ embeds: [embed] })
    } else {
      await interaction.reply('There currently is no shout.')
    }
  }
}

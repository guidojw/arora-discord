import { type CommandInteraction, EmbedBuilder } from 'discord.js'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { Command } from '../base'
import type { CommandOptions } from '..'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import applicationConfig from '../../../../configs/application'
import { constants } from '../../../../utils'
import { groupService } from '../../../../services'

const { TYPES } = constants

@injectable()
@ApplyOptions<CommandOptions>({
  command: {
    args: [
      {
        key: 'id',
        required: false,
        default: (interaction: CommandInteraction, guildContexts: GuildContextManager) => (
          interaction.inGuild()
            ? (guildContexts.resolve(interaction.guildId) as GuildContext).robloxGroupId
            : null
        )
      }
    ]
  }
})
export default class MemberCountCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (interaction: CommandInteraction, { id }: { id: number | null }): Promise<void> {
    const context = interaction.inGuild()
      ? this.guildContexts.resolve(interaction.guildId) as GuildContext
      : null

    if (id === null) {
      await interaction.reply({ content: 'Invalid group ID.', ephemeral: true })
      return
    }
    const group = await groupService.getGroup(id)

    const embed = new EmbedBuilder()
      .addFields([{ name: `${group.name}'s member count`, value: group.memberCount.toString() }])
      .setColor(context?.primaryColor ?? applicationConfig.defaultColor)
    await interaction.reply({ embeds: [embed] })
  }
}

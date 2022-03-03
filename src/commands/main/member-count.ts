import { Command, type CommandOptions } from '../base'
import { type CommandInteraction, MessageEmbed } from 'discord.js'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../utils/decorators'
import type { GuildContext } from '../../structures'
import type { GuildContextManager } from '../../managers'
import applicationConfig from '../../configs/application'
import { constants } from '../../utils'
import { groupService } from '../../services'

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
      return await interaction.reply({ content: 'Invalid group ID.', ephemeral: true })
    }
    const group = await groupService.getGroup(id)

    const embed = new MessageEmbed()
      .addField(`${group.name}'s member count`, group.memberCount.toString())
      .setColor(context?.primaryColor ?? applicationConfig.defaultColor)
    return await interaction.reply({ embeds: [embed] })
  }
}

import { Command, type CommandOptions } from '../base'
import type { type CommandInteraction, MessageEmbed } from 'discord.js'
import { ApplyOptions } from '../../util/decorators'
import type { GuildContext } from '../../structures'
import applicationConfig from '../../configs/application'
import { groupService } from '../../services'
import { injectable } from 'inversify'

@injectable()
@ApplyOptions<CommandOptions>({
  command: {
    args: [
      {
        key: 'id',
        required: false,
        default: (interaction: CommandInteraction) => (
          interaction.inCachedGuild()
            ? (interaction.client.guildContexts.resolve(interaction.guildId) as GuildContext).robloxGroupId
            : null
        )
      }
    ]
  }
})
export default class MemberCountCommand extends Command {
  public async execute (interaction: CommandInteraction, { id }: { id: number | null }): Promise<void> {
    const context = interaction.inCachedGuild()
      ? this.client.guildContexts.resolve(interaction.guildId) as GuildContext
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

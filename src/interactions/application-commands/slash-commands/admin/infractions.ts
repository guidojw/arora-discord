import { type ChatInputCommandInteraction, EmbedBuilder, type GuildMember } from 'discord.js'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { Command } from '../base'
import type { CommandOptions } from '..'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import applicationConfig from '../../../../configs/application'
import { constants } from '../../../../utils'
import { stripIndents } from 'common-tags'

const { TYPES } = constants

@injectable()
@ApplyOptions<CommandOptions>({
  command: {
    args: [
      { key: 'user' }
    ]
  }
})
export default class InfractionsCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { user }: { user: GuildMember }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const infractions = await context.fetchInfractions(user)

    const embed = new EmbedBuilder()
      .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      .setTitle(`${user.user.username}'s Infractions`)
    for (const infraction of infractions) {
      embed.addFields([{
        name: `Infraction ${infraction.id}`,
        value: stripIndents`
        **Type:** ${infraction.type}
        **User:** <@${infraction.userId}>
        **Moderator:** <@${infraction.authorId}>
        **Date:** <t:${Math.floor(infraction.createdAt.getTime() / 1000)}>
        **Reason:**
        \`${infraction.reason}\`
        `
      }])
    }

    await interaction.reply({ embeds: [embed] })
  }
}

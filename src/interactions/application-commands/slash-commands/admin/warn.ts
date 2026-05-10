import type { ChatInputCommandInteraction, GuildMember } from 'discord.js'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { Command } from '../base'
import type { CommandOptions } from '..'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import { InfractionType } from '../../../../utils/constants'
import { constants } from '../../../../utils'

const { TYPES } = constants

@injectable()
@ApplyOptions<CommandOptions>({
  command: {
    args: [
      { key: 'user' },
      { key: 'reason' }
    ]
  }
})
export default class WarnCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { user, reason }: { user: GuildMember, reason: string }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const infraction = await context.infractions.create(user.id, interaction.user.id, InfractionType.Warn, reason)
    await this.client.send(user, `You have been warned in server **${context.guild.name}** for:\n\`${reason}\``)

    await interaction.reply({
      content: `Successfully warned <@${user.id}> in infraction **${infraction.id}**. Reason:\n\`${reason}\``,
      allowedMentions: {}
    })
  }
}

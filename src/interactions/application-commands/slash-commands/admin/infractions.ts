import type { ChatInputCommandInteraction, User } from 'discord.js'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { Command } from '../base'
import type { CommandOptions } from '..'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import { constants } from '../../../../utils'

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
    { user }: { user: User }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const infractions = await context.fetchInfractions(user)

    console.log(infractions)

    await interaction.reply({
      content: 'test',
      allowedMentions: {}
    })
  }
}

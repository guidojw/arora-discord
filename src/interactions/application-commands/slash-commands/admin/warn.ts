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
    { user, reason }: { user: User, reason: string }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const member = await context.guild.members.fetch({ user })

    console.log(member)
    console.log(reason)

    await interaction.reply('test')
  }
}

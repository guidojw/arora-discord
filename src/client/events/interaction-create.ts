import { type BaseHandler, Dispatcher } from '..'
import type { Interaction, TextChannel } from 'discord.js'
import { inject, injectable, named } from 'inversify'
import type { GuildContext } from '../../structures'
import { GuildContextManager } from '../../managers'
import { constants } from '../../utils'

const { TYPES } = constants

@injectable()
export default class InteractionCreateEventHandler implements BaseHandler {
  @inject(TYPES.Dispatcher)
  private readonly dispatcher!: Dispatcher

  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async handle (interaction: Interaction): Promise<void> {
    try {
      await this.dispatcher.handleInteraction(interaction)

      if (interaction.isChatInputCommand() && interaction.inGuild()) {
        const context = this.guildContexts.resolve(interaction.guildId) as GuildContext
        const subCommandName = interaction.options.getSubcommand(false)
        await context.log(
          interaction.user,
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          `${interaction.user.toString()} **used command** \`/${interaction.commandName}${subCommandName !== null ? ` ${subCommandName}` : ''}\`${interaction.channel !== null ? ` **in** ${(interaction.channel as TextChannel).toString()}` : ''}`
        )
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors?.[0].message ?? err.toString()
      if (interaction.isRepliable() && !interaction.replied) {
        if (interaction.deferred) {
          await interaction.editReply(errorMessage)
        } else {
          await interaction.reply({
            content: errorMessage,
            ephemeral: true
          })
        }
        return
      }
      throw err
    }
  }
}

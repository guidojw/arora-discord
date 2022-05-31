import { type CommandInteraction, MessageButton } from 'discord.js'
import { inject, injectable, named } from 'inversify'
import { Command } from '../base'
import type { GuildContext } from '../../../../structures'
import type { GuildContextManager } from '../../../../managers'
import { constants } from '../../../../utils'
import { discordService } from '../../../../services'

const { TYPES } = constants

@injectable()
export default class DeleteSuggestionCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (interaction: CommandInteraction): Promise<void> {
    if (!interaction.inCachedGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    if (context.suggestionsChannel === null) {
      return await interaction.reply({ content: 'This server has no suggestionsChannel set yet.', ephemeral: true })
    }
    const messages = await context.suggestionsChannel.messages.fetch()
    const authorUrl = `https://discord.com/users/${interaction.user.id}`

    for (const suggestion of messages.values()) {
      if (suggestion.embeds[0]?.author?.url === authorUrl) {
        await interaction.reply({
          content: 'Are you sure you would like to delete this suggestion?',
          embeds: [suggestion.embeds[0]]
        })
        const [choice, promptInteraction] = await discordService.prompt(interaction.user, interaction, {
          yes: new MessageButton()
            .setLabel('Yes')
            .setStyle('SUCCESS')
            .setEmoji('✔️'),
          no: new MessageButton()
            .setLabel('No')
            .setStyle('DANGER')
            .setEmoji('✖️')
        })

        if (choice !== null) {
          if (choice === 'yes') {
            await suggestion.delete()
            await promptInteraction.reply('Successfully deleted your last suggestion.')
          } else {
            await promptInteraction.reply('Didn\'t delete your last suggestion.')
          }
        }
        return
      }
    }

    return await interaction.reply('Could not find a suggestion you made.')
  }
}

import type { BaseGuildCommandInteraction, CommandInteraction, Message } from 'discord.js'
import { Command } from '../base'
import type { GuildContext } from '../../structures'
import { discordService } from '../../services'
import { injectable } from 'inversify'

@injectable()
export default class DeleteSuggestionCommand extends Command {
  public async execute (interaction: CommandInteraction & BaseGuildCommandInteraction<'cached'>): Promise<void> {
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext

    if (context.suggestionsChannel === null) {
      return await interaction.reply({ content: 'This server has no suggestionsChannel set yet.', ephemeral: true })
    }
    const messages = await context.suggestionsChannel.messages.fetch()
    const authorUrl = `https://discord.com/users/${interaction.user.id}`

    for (const suggestion of messages.values()) {
      if (suggestion.embeds[0]?.author?.url === authorUrl) {
        const prompt = await interaction.reply({
          content: 'Are you sure you would like to delete this suggestion?',
          embeds: [suggestion.embeds[0]],
          fetchReply: true
        }) as Message
        const choice = (await discordService.prompt(interaction.user, prompt, ['✅', '🚫']))?.toString() === '✅'

        if (choice) {
          await suggestion.delete()
          await interaction.followUp('Successfully deleted your last suggestion.')
        } else {
          await interaction.followUp('Didn\'t delete your last suggestion.')
        }
        return
      }
    }

    return await interaction.reply('Could not find a suggestion you made.')
  }
}

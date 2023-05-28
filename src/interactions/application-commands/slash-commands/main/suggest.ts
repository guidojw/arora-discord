import { type Attachment, type CommandInteraction, EmbedBuilder } from 'discord.js'
import { argumentUtil, constants } from '../../../../utils'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { Command } from '../base'
import type { CommandOptions } from '..'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'

const { TYPES } = constants
const { validators, noTags } = argumentUtil

@injectable()
@ApplyOptions<CommandOptions>({
  command: {
    args: [
      {
        key: 'suggestion',
        validate: validators([noTags])
      },
      { key: 'attachment', required: false }
    ]
  }
})
export default class SuggestCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (
    interaction: CommandInteraction,
    { suggestion, attachment }: { suggestion: string, attachment: Attachment | null }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    if (context.suggestionsChannel === null) {
      await interaction.reply({ content: 'This server has no suggestionsChannel set yet.', ephemeral: true })
      return
    }
    if (/^\s*$/.test(suggestion)) {
      await interaction.reply({ content: 'Cannot suggest empty suggestions.', ephemeral: true })
      return
    }
    const authorUrl = `https://discord.com/users/${interaction.user.id}`
    const embed = new EmbedBuilder()
      .setDescription(suggestion)
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL(), url: authorUrl })
      .setColor(0x000af43)
    if (attachment !== null) {
      if (attachment.height !== null) {
        embed.setImage(attachment.url)
      }
    }

    const newMessage = await context.suggestionsChannel.send({ embeds: [embed] })
    await newMessage.react('⬆️')
    await newMessage.react('⬇️')

    await interaction.reply({ content: 'Successfully suggested', embeds: [embed] })
  }
}

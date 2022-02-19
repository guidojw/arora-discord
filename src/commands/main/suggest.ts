import { type BaseGuildCommandInteraction, type CommandInteraction, MessageEmbed } from 'discord.js'
import { ApplyOptions } from '../../util/decorators'
import { Command, type CommandOptions } from '../base'
import type { GuildContext } from '../../structures'
import { argumentUtil } from '../../util'
import { injectable } from 'inversify'

const { validators, noTags } = argumentUtil

@injectable()
@ApplyOptions<CommandOptions>({
  command: {
    args: [
      {
        key: 'suggestion',
        validate: validators([noTags])
      }
    ]
  }
})
export default class SuggestCommand extends Command {
  public async execute (
    interaction: CommandInteraction & BaseGuildCommandInteraction<'cached'>,
    { suggestion }: { suggestion: string }
  ): Promise<void> {
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext

    if (context.suggestionsChannel === null) {
      return await interaction.reply({ content: 'This server has no suggestionsChannel set yet.', ephemeral: true })
    }
    if (/^\s*$/.test(suggestion)) {
      return await interaction.reply({ content: 'Cannot suggest empty suggestions.', ephemeral: true })
    }
    const authorUrl = `https://discord.com/users/${interaction.user.id}`
    const embed = new MessageEmbed()
      .setDescription(suggestion)
      .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL(), authorUrl)
      .setColor(0x000af43)

    const newMessage = await context.suggestionsChannel.send({ embeds: [embed] })
    await newMessage.react('⬆️')
    await newMessage.react('⬇️')

    return await interaction.reply({ content: 'Successfully suggested', embeds: [embed] })
  }
}

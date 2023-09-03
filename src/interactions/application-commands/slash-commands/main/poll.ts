import { type ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import { argumentUtil, constants } from '../../../../utils'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { Command } from '../base'
import type { CommandOptions } from '..'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import applicationConfig from '../../../../configs/application'

const { TYPES } = constants
const { validators, noTags } = argumentUtil

@injectable()
@ApplyOptions<CommandOptions>({
  command: {
    args: [
      {
        key: 'poll',
        validate: validators([noTags])
      }
    ]
  }
})
export default class PollCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (interaction: ChatInputCommandInteraction, { poll }: { poll: string }): Promise<void> {
    const context = interaction.inGuild()
      ? this.guildContexts.resolve(interaction.guildId) as GuildContext
      : null

    const options = []
    for (let num = 1; num <= 10; num++) {
      if (poll.includes(`(${num})`)) {
        options.push(num)
      }
    }
    const embed = new EmbedBuilder()
      .setDescription(poll)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setColor(context?.primaryColor ?? applicationConfig.defaultColor)

    const newMessage = await interaction.reply({ embeds: [embed], fetchReply: true })
    if (options.length > 0) {
      for (const option of options) {
        await newMessage.react(`${option}⃣`)
      }
    } else {
      await newMessage.react('✔')
      await newMessage.react('✖')
    }
  }
}

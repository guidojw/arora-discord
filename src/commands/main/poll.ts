import { Command, type CommandOptions } from '../base'
import { type CommandInteraction, type Message, MessageEmbed } from 'discord.js'
import { ApplyOptions } from '../../util/decorators'
import type { GuildContext } from '../../structures'
import applicationConfig from '../../configs/application'
import { argumentUtil } from '../../util'
import { injectable } from 'inversify'

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
  public async execute (interaction: CommandInteraction, { poll }: { poll: string }): Promise<void> {
    const context = interaction.inGuild()
      ? this.client.guildContexts.resolve(interaction.guildId) as GuildContext
      : null

    const options = []
    for (let num = 1; num <= 10; num++) {
      if (poll.includes(`(${num})`)) {
        options.push(num)
      }
    }
    const embed = new MessageEmbed()
      .setDescription(poll)
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setColor(context?.primaryColor ?? applicationConfig.defaultColor)

    const newMessage = await interaction.reply({ embeds: [embed], fetchReply: true }) as Message
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

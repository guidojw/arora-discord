import { type BaseGuildCommandInteraction, type CommandInteraction, MessageEmbed } from 'discord.js'
import { Command, type CommandOptions } from '../base'
import { ApplyOptions } from '../../util/decorators'
import type { GuildContext } from '../../structures'
import { applicationAdapter } from '../../adapters'
import applicationConfig from '../../configs/application'
import { argumentUtil } from '../../util'
import { injectable } from 'inversify'
import { verificationService } from '../../services'

const { validators, noChannels, noTags, noUrls } = argumentUtil

@injectable()
@ApplyOptions<CommandOptions>({
  requiresApi: true,
  requiresRobloxGroup: true,
  command: {
    args: [{ key: 'message', validate: validators([noChannels, noTags, noUrls]) }]
  }
})
export default class ShoutCommand extends Command {
  public async execute (
    interaction: CommandInteraction & BaseGuildCommandInteraction<'cached'>,
    { message }: { message: string | null }
  ): Promise<void> {
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    const authorId = (await verificationService.fetchVerificationData(interaction.user.id))?.robloxId
    if (typeof authorId === 'undefined') {
      return await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
    }

    const shout = (await applicationAdapter('PUT', `v1/groups/${context.robloxGroupId}/status`, {
      authorId,
      message: message ?? ''
    })).data

    if (shout.body === '') {
      return await interaction.reply('Successfully cleared shout.')
    } else {
      const embed = new MessageEmbed()
        .addField('Successfully shouted', shout.body)
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      return await interaction.reply({ embeds: [embed] })
    }
  }
}

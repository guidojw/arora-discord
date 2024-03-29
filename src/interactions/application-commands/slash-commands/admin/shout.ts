import { type ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import { argumentUtil, constants } from '../../../../utils'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { Command } from '../base'
import type { CommandOptions } from '..'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import { applicationAdapter } from '../../../../adapters'
import applicationConfig from '../../../../configs/application'
import { verificationService } from '../../../../services'

const { TYPES } = constants
const { validators, noChannels, noTags, noUrls } = argumentUtil

@injectable()
@ApplyOptions<CommandOptions>({
  requiresApi: true,
  requiresRobloxGroup: true,
  command: {
    args: [
      {
        key: 'message',
        validate: validators([noChannels, noTags, noUrls])
      }
    ]
  }
})
export default class ShoutCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { message }: { message: string | null }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    const authorId = (await verificationService.fetchVerificationData(
      interaction.user.id,
      interaction.guildId
    ))?.robloxId
    if (typeof authorId === 'undefined') {
      await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
      return
    }

    const shout = (await applicationAdapter('PUT', `v1/groups/${context.robloxGroupId}/status`, {
      authorId,
      message: message ?? ''
    })).data

    if (shout.body === '') {
      await interaction.reply('Successfully cleared shout.')
    } else {
      const embed = new EmbedBuilder()
        .addFields([{ name: 'Successfully shouted', value: shout.body }])
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      await interaction.reply({ embeds: [embed] })
    }
  }
}

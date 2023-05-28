import { type ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import { constants, timeUtil } from '../../../../utils'
import { groupService, verificationService } from '../../../../services'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import type { Exile } from '../../../../services/group'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import type { RobloxUser } from '../../../../argument-types'
import { SubCommandCommand } from '../base'
import type { SubCommandCommandOptions } from '..'
import { applicationAdapter } from '../../../../adapters'
import applicationConfig from '../../../../configs/application'

const { TYPES } = constants
const { getDate, getTime } = timeUtil

@injectable()
@ApplyOptions<SubCommandCommandOptions<ExilesCommand>>({
  requiresApi: true,
  requiresRobloxGroup: true,
  subCommands: {
    create: {
      args: [{ key: 'username', name: 'user', type: 'roblox-user' }]
    },
    delete: {
      args: [{ key: 'username', name: 'user', type: 'roblox-user' }]
    },
    list: {
      args: [
        {
          key: 'username',
          name: 'user',
          type: 'roblox-user',
          required: false
        }
      ]
    }
  }
})
export default class ExilesCommand extends SubCommandCommand<ExilesCommand> {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async create (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { user, reason }: { user: RobloxUser, reason: string }
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

    await applicationAdapter('POST', `v1/groups/${context.robloxGroupId}/exiles`, {
      userId: user.id,
      authorId,
      reason
    })

    await interaction.reply(`Successfully exiled **${user.username ?? user.id}**.`)
  }

  public async delete (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { user, reason }: { user: RobloxUser, reason: string }
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

    await applicationAdapter('DELETE', `v1/groups/${context.robloxGroupId}/exiles/${user.id}`, {
      authorId,
      reason
    })

    await interaction.reply(`Successfully unexiled **${user.username ?? user.id}**.`)
  }

  public async list (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { user }: { user: RobloxUser | null }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    if (user !== null) {
      const exile: Exile = (await applicationAdapter('GET', `v1/groups/${context.robloxGroupId}/exiles/${user.id}`)).data

      const date = new Date(exile.date)
      const embed = new EmbedBuilder()
        .setTitle(`${user.username ?? user.id}'s exile`)
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
        .addFields([
          { name: 'Start date', value: getDate(date), inline: true },
          { name: 'Start time', value: getTime(date), inline: true },
          { name: 'Reason', value: exile.reason }
        ])

      await interaction.reply({ embeds: [embed] })
    } else {
      const exiles = (await applicationAdapter('GET', `v1/groups/${context.robloxGroupId}/exiles?sort=date`)).data
      if (exiles.length === 0) {
        await interaction.reply('There are currently no exiles.')
        return
      }

      const embeds = await groupService.getExileEmbeds(exiles)
      for (const embed of embeds) {
        await interaction.user.send({ embeds: [embed] })
      }

      await interaction.reply('Sent you a DM with the current exiles.')
    }
  }
}

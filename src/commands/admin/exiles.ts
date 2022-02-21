import { type CommandInteraction, MessageEmbed } from 'discord.js'
import { SubCommandCommand, type SubCommandCommandOptions } from '../base'
import { groupService, verificationService } from '../../services'
import { ApplyOptions } from '../../utils/decorators'
import type { Exile } from '../../services/group'
import type { GuildContext } from '../../structures'
import type { RobloxUser } from '../../types/roblox-user'
import { applicationAdapter } from '../../adapters'
import applicationConfig from '../../configs/application'
import { injectable } from 'inversify'
import { timeUtil } from '../../utils'

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
  public async create (
    interaction: CommandInteraction<'present'>,
    { user, reason }: { user: RobloxUser, reason: string }
  ): Promise<void> {
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    const authorId = (await verificationService.fetchVerificationData(interaction.user.id))?.robloxId
    if (typeof authorId === 'undefined') {
      return await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
    }

    await applicationAdapter('POST', `v1/groups/${context.robloxGroupId}/exiles`, {
      userId: user.id,
      authorId,
      reason
    })

    return await interaction.reply(`Successfully exiled **${user.username ?? user.id}**.`)
  }

  public async delete (
    interaction: CommandInteraction<'present'>,
    { user, reason }: { user: RobloxUser, reason: string }
  ): Promise<void> {
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    const authorId = (await verificationService.fetchVerificationData(interaction.user.id))?.robloxId
    if (typeof authorId === 'undefined') {
      return await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
    }

    await applicationAdapter('DELETE', `v1/groups/${context.robloxGroupId}/exiles/${user.id}`, {
      authorId,
      reason
    })

    return await interaction.reply(`Successfully unexiled **${user.username ?? user.id}**.`)
  }

  public async list (
    interaction: CommandInteraction<'present'>,
    { user }: { user: RobloxUser | null }
  ): Promise<void> {
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    if (user !== null) {
      const exile: Exile = (await applicationAdapter('GET', `v1/groups/${context.robloxGroupId}/exiles/${user.id}`)).data

      const date = new Date(exile.date)
      const embed = new MessageEmbed()
        .setTitle(`${user.username ?? user.id}'s exile`)
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
        .addField('Start date', getDate(date), true)
        .addField('Start time', getTime(date), true)
        .addField('Reason', exile.reason)

      return await interaction.reply({ embeds: [embed] })
    } else {
      const exiles = (await applicationAdapter('GET', `v1/groups/${context.robloxGroupId}/exiles?sort=date`)).data
      if (exiles.length === 0) {
        return await interaction.reply('There are currently no exiles.')
      }

      const embeds = await groupService.getExileEmbeds(exiles)
      for (const embed of embeds) {
        await interaction.user.send({ embeds: [embed] })
      }

      return await interaction.reply('Sent you a DM with the current exiles.')
    }
  }
}

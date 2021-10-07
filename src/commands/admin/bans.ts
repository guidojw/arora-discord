import { groupService, userService, verificationService } from '../../services'
import { ApplyOptions } from '../../util/decorators'
import type { CommandInteraction } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import type { RobloxUser } from '../../types/roblox-user'
import { SubCommandCommand } from '../base'
import type { SubCommandCommandOptions } from '../base'
import { applicationAdapter } from '../../adapters'
import applicationConfig from '../../configs/application'
import pluralize from 'pluralize'
import { timeUtil } from '../../util'

const { getDate, getTime } = timeUtil

@ApplyOptions<SubCommandCommandOptions<BansCommand>>({
  requiresApi: true,
  requiresRobloxGroup: true,
  subcommands: {
    create: {
      args: [{
        key: 'user',
        name: 'username',
        type: 'roblox-user'
      }, {
        key: 'duration',
        required: false
      }, {
        key: 'reason'
      }]
    },
    delete: {
      args: []
    },
    edit: {
      args: []
    },
    extend: {
      args: []
    },
    list: {
      args: [{
        key: 'user',
        name: 'username',
        type: 'roblox-user'
      }]
    }
  }
})
export default class BansCommand extends SubCommandCommand<BansCommand> {
  public async create (interaction: CommandInteraction, { user, duration, reason }: {
    user: RobloxUser
    duration: number | null
    reason: string
  }): Promise<void> {
    const authorId = (await verificationService.fetchVerificationData(interaction.user.id))?.robloxId
    if (typeof authorId === 'undefined') {
      return await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
    }

    await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/bans`, {
      userId: user.id,
      authorId,
      duration: duration === null ? undefined : duration * 24 * 60 * 60 * 1000,
      reason
    })

    return await interaction.reply(`Successfully banned **${user.username ?? user.id}**.`)
  }

  public async delete (interaction: CommandInteraction, { user, reason }: {
    user: RobloxUser
    reason: string
  }): Promise<void> {
    const authorId = (await verificationService.fetchVerificationData(interaction.user.id))?.robloxId
    if (typeof authorId === 'undefined') {
      return await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
    }

    await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/bans/${user.id}/cancel`, {
      authorId,
      reason
    })

    return await interaction.reply(`Successfully unbanned **${user.username ?? user.id}**.`)
  }

  public async edit (interaction: CommandInteraction, { user, key, data }: {
    user: RobloxUser
    key: string
    data: string
  }): Promise<void> {
    const changes: { authorId?: number, reason?: string } = {}
    if (key === 'author') {
      changes.authorId = await userService.getIdFromUsername(data)
    } else if (key === 'reason') {
      changes.reason = data
    }
    const editorId = (await verificationService.fetchVerificationData(interaction.user.id))?.robloxId
    if (typeof editorId === 'undefined') {
      return await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
    }

    await applicationAdapter('PUT', `v1/groups/${message.guild.robloxGroupId}/bans/${user.id}`, { changes, editorId })

    return await interaction.reply(`Successfully edited **${user.username ?? user.id}**'s ban.`)
  }

  public async extend (interaction: CommandInteraction, { user, days, reason }: {
    user: RobloxUser
    days: number
    reason: string
  }): Promise<void> {
    const authorId = (await verificationService.fetchVerificationData(interaction.user.id))?.robloxId
    if (typeof authorId === 'undefined') {
      return await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
    }

    await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/bans/${user.id}/extend`, {
      authorId,
      duration: days * 24 * 60 * 60 * 1000,
      reason
    })

    return await interaction.reply(`Successfully extended **${user.username ?? user.id}**'s ban.`)
  }

  public async list (interaction: CommandInteraction, { user }: {
    user?: RobloxUser
  }): Promise<void> {
    if (typeof user !== 'undefined') {
      const ban = (await applicationAdapter('GET', `v1/groups/${message.guild.robloxGroupId}/bans/${user.id}`)).data

      const days = ban.duration / (24 * 60 * 60 * 1000)
      const date = new Date(ban.date)
      let extensionDays = 0
      for (const extension of ban.extensions) {
        extensionDays += extension.duration / (24 * 60 * 60 * 1000)
      }
      const extensionString = extensionDays !== 0
        ? ` (${Math.sign(extensionDays) === 1 ? '+' : ''}${extensionDays})`
        : ''
      const embed = new MessageEmbed()
        .setTitle(`${user.username ?? user.id}'s ban`)
        .setColor(message.guild.primaryColor ?? applicationConfig.defaultColor)
        .addField('Start date', getDate(date), true)
        .addField('Start time', getTime(date), true)
        .addField('Duration', `${days}${extensionString} ${pluralize('day', days + extensionDays)}`, true)
        .addField('Reason', ban.reason)

      return await interaction.reply({ embeds: [embed] })
    } else {
      const bans = (await applicationAdapter('GET', `v1/groups/${interaction.guild.robloxGroupId}/bans?sort=date`)).data
      if (bans.length === 0) {
        return await interaction.reply('There are currently no bans.')
      }

      const embeds = await groupService.getBanEmbeds(interaction.guild.robloxGroupId, bans)
      for (const embed of embeds) {
        await interaction.user.send({ embeds: [embed] })
      }

      return await interaction.reply('Sent you a DM with the banlist.')
    }
  }
}

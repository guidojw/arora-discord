import { type CommandInteraction, MessageEmbed } from 'discord.js'
import { argumentUtil, constants, timeUtil } from '../../../../utils'
import { groupService, userService, verificationService } from '../../../../services'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import type { GuildContext } from '../../../../structures'
import type { GuildContextManager } from '../../../../managers'
import type { RobloxUser } from '../../../../argument-types'
import { SubCommandCommand } from '../base'
import type { SubCommandCommandOptions } from '..'
import { applicationAdapter } from '../../../../adapters'
import applicationConfig from '../../../../configs/application'
import pluralize from 'pluralize'

const { TYPES } = constants
const { getDate, getTime } = timeUtil
const { validators, noChannels, noTags, noUrls } = argumentUtil

const validateReason = validators([noChannels, noTags, noUrls])

@injectable()
@ApplyOptions<SubCommandCommandOptions<BansCommand>>({
  requiresApi: true,
  requiresRobloxGroup: true,
  subCommands: {
    create: {
      args: [
        { key: 'username', name: 'user', type: 'roblox-user' },
        { key: 'duration', required: false },
        { key: 'reason', validate: validateReason }
      ]
    },
    delete: {
      args: [
        { key: 'username', name: 'user', type: 'roblox-user' },
        { key: 'reason', validate: validateReason }
      ]
    },
    edit: {
      args: [
        { key: 'username', name: 'user', type: 'roblox-user' },
        {
          key: 'key',
          parse: (val: string) => val.toLowerCase()
        },
        { key: 'value', validate: validateReason }
      ]
    },
    extend: {
      args: [
        { key: 'username', name: 'user', type: 'roblox-user' },
        {
          key: 'days',
          validate: (val: string) => parseInt(val) !== 0
        },
        { key: 'reason', validate: validateReason }
      ]
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
export default class BansCommand extends SubCommandCommand<BansCommand> {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async create (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { user, duration, reason }: {
      user: RobloxUser
      duration: number | null
      reason: string
    }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    const authorId = (await verificationService.fetchVerificationData(
      interaction.user.id,
      interaction.guildId
    ))?.robloxId
    if (typeof authorId === 'undefined') {
      return await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
    }

    await applicationAdapter('POST', `v1/groups/${context.robloxGroupId}/bans`, {
      userId: user.id,
      authorId,
      duration: duration === null ? undefined : duration * 86_400_000,
      reason
    })

    return await interaction.reply(`Successfully banned **${user.username ?? user.id}**.`)
  }

  public async delete (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { user, reason }: { user: RobloxUser, reason: string }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    const authorId = (await verificationService.fetchVerificationData(
      interaction.user.id,
      interaction.guildId
    ))?.robloxId
    if (typeof authorId === 'undefined') {
      return await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
    }

    await applicationAdapter('POST', `v1/groups/${context.robloxGroupId}/bans/${user.id}/cancel`, {
      authorId,
      reason
    })

    return await interaction.reply(`Successfully unbanned **${user.username ?? user.id}**.`)
  }

  public async edit (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { user, key, value }: {
      user: RobloxUser
      key: string
      value: string
    }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    const changes: { authorId?: number, reason?: string } = {}
    if (key === 'author') {
      changes.authorId = await userService.getIdFromUsername(value)
    } else if (key === 'reason') {
      changes.reason = value
    }
    const editorId = (await verificationService.fetchVerificationData(
      interaction.user.id,
      interaction.guildId
    ))?.robloxId
    if (typeof editorId === 'undefined') {
      return await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
    }

    await applicationAdapter('PUT', `v1/groups/${context.robloxGroupId}/bans/${user.id}`, { changes, editorId })

    return await interaction.reply(`Successfully edited **${user.username ?? user.id}**'s ban.`)
  }

  public async extend (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { user, days, reason }: {
      user: RobloxUser
      days: number
      reason: string
    }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    const authorId = (await verificationService.fetchVerificationData(
      interaction.user.id,
      interaction.guildId
    ))?.robloxId
    if (typeof authorId === 'undefined') {
      return await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
    }

    await applicationAdapter('POST', `v1/groups/${context.robloxGroupId}/bans/${user.id}/extend`, {
      authorId,
      duration: days * 86_400_000,
      reason
    })

    return await interaction.reply(`Successfully extended **${user.username ?? user.id}**'s ban.`)
  }

  public async list (
    interaction: CommandInteraction<'raw' | 'cached'>,
    { user }: { user: RobloxUser | null }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    if (user !== null) {
      const ban = (await applicationAdapter('GET', `v1/groups/${context.robloxGroupId}/bans/${user.id}`)).data

      const days = ban.duration / 86_400_000
      const date = new Date(ban.date)
      let extensionDays = 0
      for (const extension of ban.extensions) {
        extensionDays += extension.duration / 86_400_000
      }
      const extensionString = extensionDays !== 0
        ? ` (${Math.sign(extensionDays) === 1 ? '+' : ''}${extensionDays})`
        : ''
      const embed = new MessageEmbed()
        .setTitle(`${user.username ?? user.id}'s ban`)
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
        .addField('Start date', getDate(date), true)
        .addField('Start time', getTime(date), true)
        .addField('Duration', `${days}${extensionString} ${pluralize('day', days + extensionDays)}`, true)
        .addField('Reason', ban.reason)

      return await interaction.reply({ embeds: [embed] })
    } else {
      await interaction.deferReply()

      const bans = (await applicationAdapter('GET', `v1/groups/${context.robloxGroupId}/bans?sort=date`)).data
      if (bans.length === 0) {
        return await interaction.reply('There are currently no bans.')
      }

      const embeds = await groupService.getBanEmbeds(context.robloxGroupId, bans)
      for (const embed of embeds) {
        await interaction.user.send({ embeds: [embed] })
      }

      await interaction.editReply('Sent you a DM with the banlist.')
    }
  }
}

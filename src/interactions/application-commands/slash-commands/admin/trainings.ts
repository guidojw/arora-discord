import { type AutocompleteInteraction, type ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import { argumentUtil, constants, timeUtil } from '../../../../utils'
import { groupService, userService, verificationService } from '../../../../services'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import { SubCommandCommand } from '../base'
import type { SubCommandCommandOptions } from '..'
import type { Training } from '../../../../services/group'
import { applicationAdapter } from '../../../../adapters'
import applicationConfig from '../../../../configs/application'

const { TYPES } = constants
const { getDate, getDateInfo, getTime, getTimeInfo, getTimeZoneAbbreviation } = timeUtil
const { noChannels, noTags, noUrls, validDate, validTime, validators } = argumentUtil

const parseKey = (val: string): string => val.toLowerCase()
const validateReason = validators([noChannels, noTags, noUrls])

@injectable()
@ApplyOptions<SubCommandCommandOptions<TrainingsCommand>>({
  requiresApi: true,
  requiresRobloxGroup: true,
  subCommands: {
    schedule: {
      args: [
        { key: 'type', parse: parseKey },
        { key: 'date', type: 'date' },
        { key: 'time', type: 'time' },
        { key: 'notes', validate: validateReason, required: false }
      ]
    },
    cancel: {
      args: [
        { key: 'id' },
        { key: 'reason', validate: validateReason }
      ]
    },
    edit: {
      args: [
        { key: 'id' },
        { key: 'key', parse: parseKey },
        {
          key: 'value',
          validate: validateReason,
          parse: (val: string) => val.toLowerCase() === 'none' ? null : val
        }
      ]
    },
    list: {
      args: [{ key: 'id', required: false }]
    }
  }
})
export default class TrainingsCommand extends SubCommandCommand<TrainingsCommand> {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async schedule (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { type, date, time, notes }: {
      type: string
      date: string
      time: string
      notes: string | null
    }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    const dateInfo = getDateInfo(date)
    const timeInfo = getTimeInfo(time)
    const dateUnix = Math.floor(new Date(
      dateInfo.year,
      dateInfo.month,
      dateInfo.day,
      timeInfo.hours,
      timeInfo.minutes
    ).getTime())
    const afterNow = dateUnix - Date.now() > 0
    if (!afterNow) {
      await interaction.reply({ content: 'Please give a date and time that are after now.', ephemeral: true })
      return
    }
    const trainingTypes = await groupService.getTrainingTypes(context.robloxGroupId)
    let trainingType = trainingTypes.find(trainingType => trainingType.abbreviation.toLowerCase() === type)
    trainingType ??= trainingTypes.find(trainingType => trainingType.name.toLowerCase() === type)
    if (typeof trainingType === 'undefined') {
      await interaction.reply({ content: 'Type not found.', ephemeral: true })
      return
    }
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

    const training = (await applicationAdapter('POST', `v1/groups/${context.robloxGroupId}/trainings`, {
      authorId,
      date: dateUnix,
      notes: notes ?? undefined,
      typeId: trainingType.id
    })).data

    const embed = new EmbedBuilder()
      .addFields([
        { name: 'Successfully scheduled', value: `**${trainingType.name}** training on **${date}** at **${time}**.` },
        { name: 'Training ID', value: training.id.toString() }
      ])
      .setColor(context.primaryColor ?? applicationConfig.defaultColor)
    await interaction.reply({ embeds: [embed] })
  }

  public async cancel (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { id, reason }: { id: number, reason: string }
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

    await applicationAdapter('POST', `v1/groups/${context.robloxGroupId}/trainings/${id}/cancel`, {
      authorId,
      reason
    })

    await interaction.reply(`Successfully cancelled training with ID **${id}**.`)
  }

  public async edit (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { id, key, value }: {
      id: number
      key: string
      value: string | null
    }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    if (['author', 'type', 'date', 'time'].includes(key) && value === null) {
      await interaction.reply({ content: `Invalid ${key}`, ephemeral: true })
      return
    }

    const changes: { authorId?: number, notes?: string | null, typeId?: number, date?: number } = {}
    if (key === 'author') {
      changes.authorId = await userService.getIdFromUsername(value as string)
    } else if (key === 'notes') {
      changes.notes = value
    } else if (key === 'type') {
      const type = (value as string).toUpperCase()
      const trainingTypes = await groupService.getTrainingTypes(context.robloxGroupId)
      let trainingType = trainingTypes.find(trainingType => trainingType.abbreviation.toLowerCase() === type)
      trainingType ??= trainingTypes.find(trainingType => trainingType.name.toLowerCase() === type)
      if (typeof trainingType === 'undefined') {
        await interaction.reply({ content: 'Type not found.', ephemeral: true })
        return
      }

      changes.typeId = trainingType.id
    } else if (key === 'date' || key === 'time') {
      const training = (await applicationAdapter('GET', `v1/groups/${context.robloxGroupId}/trainings/${id}`))
        .data
      const date = new Date(training.date)

      let dateInfo
      let timeInfo
      if (key === 'date') {
        if (!validDate(value as string)) {
          await interaction.reply({ content: 'Please enter a valid date.', ephemeral: true })
          return
        }
        dateInfo = getDateInfo(value as string)
        timeInfo = getTimeInfo(getTime(date))
      } else {
        if (!validTime(value as string)) {
          await interaction.reply({ content: 'Please enter a valid time.', ephemeral: true })
          return
        }
        dateInfo = getDateInfo(getDate(date))
        timeInfo = getTimeInfo(value as string)
      }

      changes.date = Math.floor(new Date(dateInfo.year, dateInfo.month, dateInfo.day, timeInfo.hours, timeInfo.minutes)
        .getTime())
    }
    const editorId = (await verificationService.fetchVerificationData(
      interaction.user.id,
      interaction.guildId
    ))?.robloxId
    if (typeof editorId === 'undefined') {
      await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
      return
    }

    await applicationAdapter('PUT', `v1/groups/${context.robloxGroupId}/trainings/${id}`, {
      changes,
      editorId
    })

    await interaction.reply(`Successfully edited training with ID **${id}**.`)
  }

  public async list (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { id }: { id: number | null }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    if (id !== null) {
      const training: Training = (await applicationAdapter('GET', `v1/groups/${context.robloxGroupId}/trainings/${id}`))
        .data
      const username = (await userService.getUser(training.authorId)).name
      const date = new Date(training.date)

      const embed = new EmbedBuilder()
        .setTitle(`Training ${training.id}`)
        .addFields([
          { name: 'Type', value: training.type?.abbreviation ?? 'Deleted', inline: true },
          { name: 'Date', value: getDate(date), inline: true },
          { name: 'Time', value: `${getTime(date)} ${getTimeZoneAbbreviation(date)}`, inline: true },
          { name: 'Host', value: username, inline: true }
        ])
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      await interaction.reply({ embeds: [embed] })
    } else {
      const trainings: Training[] = (await applicationAdapter('GET', `v1/groups/${context.robloxGroupId}/trainings?sort=date`))
        .data
      if (trainings.length === 0) {
        await interaction.reply('There are currently no hosted trainings.')
        return
      }

      const embeds = await groupService.getTrainingEmbeds(trainings)
      for (const embed of embeds) {
        await interaction.user.send({ embeds: [embed] })
      }
      await interaction.reply('Sent you a DM with the upcoming trainings.')
    }
  }

  public override async autocomplete (interaction: AutocompleteInteraction): Promise<void> {
    if (applicationConfig.apiEnabled !== true || !interaction.inGuild()) {
      await interaction.respond([])
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext
    if (context.robloxGroupId === null) {
      await interaction.respond([])
      return
    }

    const option = interaction.options.getFocused(true)
    if (option.name === 'type' || (option.name === 'value' && interaction.options.getString('key') === 'type')) {
      const results = (await groupService.getTrainingTypes(context.robloxGroupId)).filter(trainingType => (
        trainingType.abbreviation.toLowerCase().startsWith(option.value) ||
        trainingType.name.toLowerCase().startsWith(option.value)
      ))
      await interaction.respond(results.map(result => ({
        name: result.name,
        value: result.abbreviation
      })).slice(0, 25))
      return
    }

    await super.autocomplete(interaction)
  }
}

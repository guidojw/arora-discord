import { argumentUtil, timeUtil } from '../../util'
import { groupService, userService, verificationService } from '../../services'
import { ApplyOptions } from '../../util/decorators'
import type { CommandInteraction } from 'discord.js'
import type { GuildContext } from '../../structures'
import { MessageEmbed } from 'discord.js'
import { SubCommandCommand } from '../base'
import type { SubCommandCommandOptions } from '../base'
import type { Training } from '../../services/group'
import { applicationAdapter } from '../../adapters'
import applicationConfig from '../../configs/application'

const { getDate, getDateInfo, getTime, getTimeInfo, getTimeZoneAbbreviation } = timeUtil
const { noChannels, noTags, noUrls, validDate, validTime, validators } = argumentUtil

@ApplyOptions<SubCommandCommandOptions<TrainingsCommand>>({
  requiresApi: true,
  requiresRobloxGroup: true,
  subcommands: {
    create: {
      args: [{
        key: 'type',
        parse: (val: string) => val.toLowerCase()
      }, {
        key: 'date',
        type: 'date'
      }, {
        key: 'time',
        type: 'time'
      }, {
        key: 'notes',
        required: false,
        validate: validators([noChannels, noTags, noUrls])
      }]
    },
    cancel: {
      args: [{
        key: 'id'
      }, {
        key: 'reason',
        validate: validators([noChannels, noTags, noUrls])
      }]
    },
    edit: {
      args: [{
        key: 'id'
      }, {
        key: 'key',
        parse: (val: string) => val.toLowerCase()
      }, {
        key: 'value',
        validate: validators([noChannels, noTags, noUrls]),
        parse: (val: string) => val.toLowerCase() === 'none' ? null : val
      }]
    },
    list: {
      args: [{
        key: 'id',
        required: false
      }]
    }
  }
})
export default class TrainingsCommand extends SubCommandCommand<TrainingsCommand> {
  public async create (interaction: CommandInteraction, { type, date, time, notes }: {
    type: string
    date: string
    time: string
    notes?: string
  }): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

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
      return await interaction.reply({ content: 'Please give a date and time that are after now.', ephemeral: true })
    }
    const trainingTypes = await groupService.getTrainingTypes(context.robloxGroupId)
    let trainingType = trainingTypes.find(trainingType => trainingType.abbreviation.toLowerCase() === type)
    trainingType ??= trainingTypes.find(trainingType => trainingType.name.toLowerCase() === type)
    if (typeof trainingType === 'undefined') {
      return await interaction.reply({ content: 'Type not found.', ephemeral: true })
    }
    const authorId = (await verificationService.fetchVerificationData(interaction.user.id))?.robloxId
    if (typeof authorId === 'undefined') {
      return await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
    }

    const training = (await applicationAdapter('POST', `v1/groups/${context.robloxGroupId}/trainings`, {
      authorId,
      date: dateUnix,
      notes,
      typeId: trainingType.id
    })).data

    const embed = new MessageEmbed()
      .addField('Successfully scheduled', `**${trainingType.name}** training on **${date}** at **${time}**.`)
      .addField('Training ID', training.id.toString())
      .setColor(context.primaryColor ?? applicationConfig.defaultColor)
    return await interaction.reply({ embeds: [embed] })
  }

  public async cancel (interaction: CommandInteraction, { id, reason }: {
    id: number
    reason: string
  }): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    const authorId = (await verificationService.fetchVerificationData(interaction.user.id))?.robloxId
    if (typeof authorId === 'undefined') {
      return await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
    }

    await applicationAdapter('POST', `v1/groups/${context.robloxGroupId}/trainings/${id}/cancel`, {
      authorId,
      reason
    })

    return await interaction.reply(`Successfully cancelled training with ID **${id}**.`)
  }

  public async edit (interaction: CommandInteraction, { id, key, value }: {
    id: number
    key: string
    value: string | null
  }): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    if (['author', 'type', 'date', 'time'].includes(key) && value === null) {
      return await interaction.reply({ content: `Invalid ${key}`, ephemeral: true })
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
        return await interaction.reply({ content: 'Type not found.', ephemeral: true })
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
          return await interaction.reply({ content: 'Please enter a valid date.', ephemeral: true })
        }
        dateInfo = getDateInfo(value as string)
        timeInfo = getTimeInfo(getTime(date))
      } else {
        if (!validTime(value as string)) {
          return await interaction.reply({ content: 'Please enter a valid time.', ephemeral: true })
        }
        dateInfo = getDateInfo(getDate(date))
        timeInfo = getTimeInfo(value as string)
      }

      changes.date = Math.floor(new Date(dateInfo.year, dateInfo.month, dateInfo.day, timeInfo.hours, timeInfo.minutes)
        .getTime())
    }
    const editorId = (await verificationService.fetchVerificationData(interaction.user.id))?.robloxId
    if (typeof editorId === 'undefined') {
      return await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
    }

    await applicationAdapter('PUT', `v1/groups/${context.robloxGroupId}/trainings/${id}`, {
      changes,
      editorId
    })

    return await interaction.reply(`Successfully edited training with ID **${id}**.`)
  }

  public async list (interaction: CommandInteraction, { id }: { id: number | null }): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    if (id !== null) {
      const training: Training = (await applicationAdapter('GET', `v1/groups/${context.robloxGroupId}/trainings/${id}`))
        .data
      const username = (await userService.getUser(training.authorId)).name
      const date = new Date(training.date)

      const embed = new MessageEmbed()
        .setTitle(`Training ${training.id}`)
        .addField('Type', training.type?.abbreviation ?? 'Deleted', true)
        .addField('Date', getDate(date), true)
        .addField('Time', `${getTime(date)} ${getTimeZoneAbbreviation(date)}`, true)
        .addField('Host', username, true)
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      return await interaction.reply({ embeds: [embed] })
    } else {
      const trainings: Training[] = (await applicationAdapter('GET', `v1/groups/${context.robloxGroupId}/trainings?sort=date`))
        .data
      if (trainings.length === 0) {
        return await interaction.reply('There are currently no hosted trainings.')
      }

      const embeds = await groupService.getTrainingEmbeds(trainings)
      for (const embed of embeds) {
        await interaction.user.send({ embeds: [embed] })
      }
      return await interaction.reply('Sent you a DM with the upcoming trainings.')
    }
  }
}
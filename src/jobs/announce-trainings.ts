import { groupService, userService } from '../services'
import type BaseJob from './base'
import type { GetUsers } from '../services/user'
import type { Guild } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import type { Training } from '../services/group'
import { applicationAdapter } from '../adapters'
import applicationConfig from '../configs/application'
import { injectable } from 'inversify'
import lodash from 'lodash'
import pluralize from 'pluralize'
import { timeUtil } from '../util'

const { getDate, getTime, getTimeZoneAbbreviation } = timeUtil

@injectable()
export default class AnnounceTrainingsJob implements BaseJob {
  public async run (guild: Guild): Promise<void> {
    if (guild.robloxGroupId === null) {
      return
    }
    const trainingsInfoPanel = guild.panels.resolve('trainingsInfoPanel')
    const trainingsPanel = guild.panels.resolve('trainingsPanel')
    if (trainingsInfoPanel?.message == null && trainingsPanel?.message == null) {
      return
    }

    const trainings: Training[] = (await applicationAdapter(
      'GET',
      `v1/groups/${guild.robloxGroupId}/trainings?sort=date`
    )).data
    const authorIds = [...new Set(trainings.map(training => training.authorId))]
    const authors = await userService.getUsers(authorIds)

    // Trainings Info Panel
    if (trainingsInfoPanel?.message != null) {
      const embed = trainingsInfoPanel.embed.setColor(guild.primaryColor ?? applicationConfig.defaultColor)
      const now = new Date()

      if (embed.description !== null) {
        embed.setDescription(embed.description.replace(/{timezone}/g, getTimeZoneAbbreviation(now)))
      }

      const nextTraining = trainings.find(training => new Date(training.date) > now)
      embed.addField(
        ':pushpin: Next training',
        typeof nextTraining !== 'undefined'
          ? getNextTrainingMessage(nextTraining, authors)
          : ':x: There are currently no scheduled trainings.'
      )

      await trainingsInfoPanel.message.edit({ embeds: [embed] })
    }

    // Trainings Panel
    if (trainingsPanel?.message != null) {
      const embed = await getTrainingsEmbed(guild.robloxGroupId, trainings, authors)

      embed.setColor(guild.primaryColor ?? applicationConfig.defaultColor)

      await trainingsPanel.message.edit({ embeds: [embed] })
    }
  }
}

async function getTrainingsEmbed (groupId: number, trainings: Training[], authors: GetUsers): Promise<MessageEmbed> {
  const trainingTypes = (await groupService.getTrainingTypes(groupId))
    .map(trainingType => trainingType.name)
    .reduce((result: Record<string, Training[]>, item) => {
      result[item] = []
      return result
    }, {})
  const groupedTrainings = lodash.assign({}, trainingTypes, groupService.groupTrainingsByType(trainings))

  const types = Object.keys(groupedTrainings)
  const embed = new MessageEmbed()
    .setFooter('Updated at')
    .setTimestamp()

  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    const typeTrainings = groupedTrainings[type]
    let result = ''

    if (typeTrainings.length > 0) {
      for (let j = 0; j < typeTrainings.length; j++) {
        const training = typeTrainings[j]
        result += getTrainingMessage(training, authors)
        if (j < typeTrainings.length) {
          result += '\n'
        }
      }
    } else {
      result += ':x: No scheduled trainings'
    }

    embed.addField(type, result)
  }
  return embed
}

function getTrainingMessage (training: Training, authors: GetUsers): string {
  const now = new Date()
  const today = now.getDate()
  const date = new Date(training.date)
  const timeString = getTime(date)
  const trainingDay = date.getDate()
  const dateString = trainingDay === today ? 'Today' : trainingDay === today + 1 ? 'Tomorrow' : getDate(date)
  const author = authors.find(author => author.id === training.authorId)
  const hourDifference = date.getHours() - now.getHours()

  let result = `:calendar_spiral: **${dateString}** at **${timeString}** hosted by ${author?.name ?? training.authorId}`

  if (trainingDay === today && hourDifference <= 5) {
    if (hourDifference <= 1) {
      const minuteDifference = hourDifference * 60 + date.getMinutes() - now.getMinutes()
      if (minuteDifference >= 0) {
        result += `\n> :alarm_clock: Starts in: **${pluralize('minute', minuteDifference, true)}**`
      } else {
        result += `\n> :alarm_clock: Started **${pluralize('minute', -1 * minuteDifference, true)}** ago`
      }
    } else {
      result += `\n> :alarm_clock: Starts in: **${pluralize('hour', hourDifference, true)}**`
    }
  }

  if (training.notes !== null) {
    result += `\n> :notepad_spiral: ${training.notes}`
  }
  return result
}

function getNextTrainingMessage (training: Training, authors: GetUsers): string {
  const now = new Date()
  const today = now.getDate()
  const date = new Date(training.date)
  const timeString = getTime(date)
  const trainingDay = date.getDate()
  const dateString = trainingDay === today ? 'today' : trainingDay === today + 1 ? 'tomorrow' : getDate(date)
  const author = authors.find(author => author.id === training.authorId)

  let result = `${training.type?.abbreviation ?? '(Deleted)'} **${dateString}** at **${timeString}** hosted by ${author?.name ?? training.authorId}`

  if (training.notes !== null) {
    result += `\n${training.notes}`
  }
  return result
}

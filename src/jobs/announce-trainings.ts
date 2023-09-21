import cron, { type JobCallback } from 'node-schedule'
import { groupService, userService } from '../services'
import type BaseJob from './base'
import { EmbedBuilder } from 'discord.js'
import type { GetUsers } from '../services/user'
import type { GuildContext } from '../structures'
import type { Training } from '../services/group'
import { applicationAdapter } from '../adapters'
import applicationConfig from '../configs/application'
import { injectable } from 'inversify'
import lodash from 'lodash'

@injectable()
export default class AnnounceTrainingsJob implements BaseJob {
  public async run (context: GuildContext): Promise<void> {
    if (context.robloxGroupId === null) {
      throw new Error(`GuildContext with id '${context.id}' has no robloxGroupId`)
    }
    const trainingsInfoPanel = context.panels.resolve('trainingsInfoPanel')
    const trainingsPanel = context.panels.resolve('trainingsPanel')
    if (trainingsInfoPanel?.message == null && trainingsPanel?.message == null) {
      return
    }

    const trainings: Training[] = (await applicationAdapter(
      'GET',
      `v1/groups/${context.robloxGroupId}/trainings?sort=date`
    )).data
    for (const training of trainings) {
      const jobName = `training_${training.id}`
      const job = cron.scheduledJobs[jobName]
      if (typeof job === 'undefined') {
        cron.scheduleJob(
          jobName,
          new Date(new Date(training.date).getTime() + 15 * 60_000),
          this.run.bind(this, context) as JobCallback
        )
      }
    }

    const authorIds = [...new Set(trainings.map(training => training.authorId))]
    const authors = await userService.getUsers(authorIds)

    // Trainings Info Panel
    if (trainingsInfoPanel?.message != null) {
      const embed = trainingsInfoPanel.embed.setColor(context.primaryColor ?? applicationConfig.defaultColor)
      const now = new Date()

      const nextTraining = trainings.find(training => new Date(training.date) > now)
      embed.addFields([
        {
          name: ':pushpin: Next training',
          value: typeof nextTraining !== 'undefined'
            ? getNextTrainingMessage(nextTraining, authors)
            : ':x: There are currently no scheduled trainings.'
        }
      ])

      await trainingsInfoPanel.message.edit({ embeds: [embed] })
    }

    // Trainings Panel
    if (trainingsPanel?.message != null) {
      const embed = await getTrainingsEmbed(context.robloxGroupId, trainings, authors)

      embed.setColor(context.primaryColor ?? applicationConfig.defaultColor)

      await trainingsPanel.message.edit({ embeds: [embed] })
    }
  }
}

async function getTrainingsEmbed (groupId: number, trainings: Training[], authors: GetUsers): Promise<EmbedBuilder> {
  const trainingTypes = (await groupService.getTrainingTypes(groupId))
    .map(trainingType => trainingType.name)
    .reduce((result: Record<string, Training[]>, item) => {
      result[item] = []
      return result
    }, {})
  const groupedTrainings = lodash.assign({}, trainingTypes, groupService.groupTrainingsByType(trainings))

  const types = Object.keys(groupedTrainings)
  const embed = new EmbedBuilder()
    .setFooter({ text: 'Updated at' })
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

    embed.addFields([{ name: type, value: result }])
  }
  return embed
}

function getTrainingMessage (training: Training, authors: GetUsers): string {
  const date = new Date(training.date)
  const author = authors.find(author => author.id === training.authorId)

  let result = `:calendar_spiral: <t:${date.getTime()}:d> at <t:${date.getTime()}:t> hosted by ${author?.name ?? training.authorId}`

  if (training.notes !== null) {
    result += `\n> :notepad_spiral: ${training.notes}`
  }
  return result
}

function getNextTrainingMessage (training: Training, authors: GetUsers): string {
  const date = new Date(training.date)
  const author = authors.find(author => author.id === training.authorId)

  let result = `${training.type?.abbreviation ?? '(Deleted)'} training on <t:${date.getTime()}:d> at <t:${date.getTime()}:t> hosted by ${author?.name ?? training.authorId}`

  if (training.notes !== null) {
    result += `\n${training.notes}`
  }
  return result
}

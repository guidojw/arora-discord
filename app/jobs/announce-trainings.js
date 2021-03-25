'use strict'
const lodash = require('lodash')
const pluralize = require('pluralize')

const { MessageEmbed } = require('discord.js')
const { applicationAdapter } = require('../adapters')
const { groupService, userService } = require('../services')
const { getDate, getTime, isDst } = require('../util').timeUtil

async function announceTrainingsJob (guild) {
  if (guild.robloxGroupId === null) {
    return
  }
  const trainingsInfoPanel = guild.panels.resolve('trainingsInfoPanel')
  const trainingsPanel = guild.panels.resolve('trainingsPanel')
  if (!trainingsInfoPanel?.message && !trainingsPanel?.message) {
    return
  }

  const trainings = (await applicationAdapter('get', `/v1/groups/${guild.robloxGroupId}/trainings?sort=date`)).data
  const authorIds = [...new Set(trainings.map(training => training.authorId))]
  const authors = await userService.getUsers(authorIds)

  // Trainings Info Panel
  if (trainingsInfoPanel?.message) {
    const embed = trainingsInfoPanel.embed.setColor(guild.primaryColor)
    const now = new Date()

    const dstNow = isDst(now)
    embed.setDescription(embed.description.replace(/{timezone}/g, dstNow ? 'CEST' : 'CET'))

    const nextTraining = trainings.find(training => new Date(training.date) > now)
    embed.addField(
      ':pushpin: Next training',
      nextTraining
        ? getNextTrainingMessage(nextTraining, authors)
        : ':x: There are currently no scheduled trainings.'
    )

    await trainingsInfoPanel.message.edit(embed)
  }

  // Trainings Panel
  if (trainingsPanel?.message) {
    const embed = await getTrainingsEmbed(guild.robloxGroupId, trainings, authors)

    embed.setColor(guild.primaryColor)

    await trainingsPanel.message.edit(embed)
  }
}

async function getTrainingsEmbed (groupId, trainings, authors) {
  const trainingTypes = (await groupService.getTrainingTypes(groupId))
    .map(trainingType => trainingType.name)
    .reduce((result, item) => (result[item] = []) && result, {})
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
        if (j < typeTrainings.length) result += '\n'
      }
    } else {
      result += ':x: No scheduled trainings'
    }

    embed.addField(type, result)
  }
  return embed
}

function getTrainingMessage (training, authors) {
  const now = new Date()
  const today = now.getDate()
  const date = new Date(training.date)
  const timeString = getTime(date)
  const trainingDay = date.getDate()
  const dateString = trainingDay === today ? 'Today' : trainingDay === today + 1 ? 'Tomorrow' : getDate(date)
  const author = authors.find(author => author.id === training.authorId)
  const hourDifference = date.getHours() - now.getHours()

  let result = `:calendar_spiral: **${dateString}** at **${timeString}** hosted by ${author.name}`

  if (trainingDay === today && hourDifference <= 5) {
    if (hourDifference === 0) {
      const minuteDifference = date.getMinutes() - now.getMinutes()
      if (minuteDifference >= 0) {
        result += `\n> :alarm_clock: Starts in: **${pluralize('minute', minuteDifference, true)}**`
      } else {
        result += `\n> :alarm_clock: Started **${pluralize('minute', -1 * minuteDifference, true)}** ago`
      }
    } else {
      result += `\n> :alarm_clock: Starts in: **${pluralize('hour', hourDifference, true)}**`
    }
  }

  if (training.notes) {
    result += `\n> :notepad_spiral: ${training.notes}`
  }
  return result
}

function getNextTrainingMessage (training, authors) {
  const now = new Date()
  const today = now.getDate()
  const date = new Date(training.date)
  const timeString = getTime(date)
  const trainingDay = date.getDate()
  const dateString = trainingDay === today ? 'today' : trainingDay === today + 1 ? 'tomorrow' : getDate(date)
  const author = authors.find(author => author.id === training.authorId)

  let result = `${training.type.abbreviation} **${dateString}** at **${timeString}** hosted by ${author.name}`

  if (training.notes) {
    result += `\n${training.notes}`
  }
  return result
}

module.exports = announceTrainingsJob

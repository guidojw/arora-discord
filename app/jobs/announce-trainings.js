'use strict'
const lodash = require('lodash')
const pluralize = require('pluralize')
const applicationAdapter = require('../adapters/application')
const userService = require('../services/user')
const groupService = require('../services/group')
const timeHelper = require('../helpers/time')

const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../config/application')

module.exports = async guild => {
  if (guild.robloxGroupId === null) {
    return
  }
  const channels = guild.getData('channels')
  const messages = guild.getData('messages')
  const channel = guild.channels.cache.get(channels.trainingsChannel)

  // Update the trainings list embed.
  const message = await channel.messages.fetch(messages.trainingsMessage)
  const trainings = (await applicationAdapter('get', `/v1/groups/${guild.robloxGroupId}/trainings?sort=date`))
    .data
  const authorIds = [...new Set(trainings.map(training => training.authorId))]
  const authors = await userService.getUsers(authorIds)
  const trainingsEmbed = await getTrainingsEmbed(guild.robloxGroupId, trainings, authors)
  trainingsEmbed.setColor(guild.getData('primaryColor'))
  await message.edit(trainingsEmbed)

  const now = new Date()

  // Get the message and its embed.
  const infoMessage = await channel.messages.fetch(messages.trainingInfoMessage)
  const embed = infoMessage.embeds[0]

  // Update timezone if the timezone in the embed is incorrect.
  const dstNow = timeHelper.isDst(now)
  const change = (dstNow && embed.description.indexOf('CET') !== -1) ||
    (!dstNow && embed.description.indexOf('CEST') !== -1)
  if (change) {
    embed.description = embed.description.replace(
      dstNow ? 'CET' : 'CEST',
      dstNow ? 'CEST' : 'CET'
    )
  }

  // Change the next training field.
  const nextTraining = trainings.find(training => new Date(training.date) > now)
  embed.fields[1].value = nextTraining
    ? getNextTrainingMessage(nextTraining, authors)
    : ':x: There are currently no scheduled trainings.'

  // Edit the actual message.
  await infoMessage.edit(infoMessage.embeds)
}

async function getTrainingsEmbed (groupId, trainings, authors) {
  const trainingTypes = (await groupService.getTrainingTypes(groupId))
    .map(trainingType => trainingType.name)
    .reduce((result, item) => {
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
  const timeString = timeHelper.getTime(date)
  const trainingDay = date.getDate()
  const dateString = trainingDay === today ? 'Today' : trainingDay === today + 1 ? 'Tomorrow' : timeHelper.getDate(date)
  const author = authors.find(author => author.id === training.authorId)
  const hourDifference = date.getHours() - now.getHours()

  let result = `:calendar_spiral: **${dateString}** at **${timeString}** hosted by ${author.name}`

  if (trainingDay === today && hourDifference <= 5) {
    if (hourDifference === 0) {
      const minuteDifference = date.getMinutes() - now.getMinutes()
      if (minuteDifference >= 0) {
        result += `\n> :alarm_clock: Starts in: **${minuteDifference} ${pluralize('minute',
          minuteDifference)}**`
      } else {
        result += `\n> :alarm_clock: Started **${-1 * minuteDifference} ${pluralize('minute',
          minuteDifference)}** ago`
      }
    } else {
      result += `\n> :alarm_clock: Starts in: **${hourDifference} ${pluralize('hour', hourDifference)}**`
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
  const timeString = timeHelper.getTime(date)
  const trainingDay = date.getDate()
  const dateString = trainingDay === today ? 'today' : trainingDay === today + 1 ? 'tomorrow' : timeHelper.getDate(date)
  const author = authors.find(author => author.id === training.authorId)

  let result = `${training.type.abbreviation} **${dateString}** at **${timeString}** hosted by ${author.name}`

  if (training.notes) {
    result += `\n${training.notes}`
  }
  return result
}

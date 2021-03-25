'use strict'
const pluralize = require('pluralize')
const discordService = require('./discord')
const userService = require('../services/user')

const { applicationAdapter } = require('../adapters')
const { getDate, getTime, isDst } = require('../util').timeUtil
const { getAbbreviation } = require('../util').util

exports.getTrainingEmbeds = async trainings => {
  const userIds = [...new Set([
    ...trainings.map(training => training.authorId)
  ])]
  const users = await userService.getUsers(userIds)

  return discordService.getListEmbeds(
    'Upcoming Trainings',
    trainings,
    exports.getTrainingRow,
    { users }
  )
}

exports.getTrainingRow = (training, { users }) => {
  const username = users.find(user => user.id === training.authorId).name
  const date = new Date(training.date)
  const readableDate = getDate(date)
  const readableTime = getTime(date)

  return `${training.id}. **${training.type.abbreviation}** training on **${readableDate}** at **${readableTime} ${isDst(date) ? 'CEST' : 'CET'}**, hosted by **${username}**.`
}

exports.getSuspensionEmbeds = async (groupId, suspensions) => {
  const userIds = [...new Set([
    ...suspensions.map(suspension => suspension.userId),
    ...suspensions.map(suspension => suspension.authorId)
  ])]
  const users = await userService.getUsers(userIds)
  const roles = await this.getRoles(groupId)

  return discordService.getListEmbeds(
    'Current Suspensions',
    suspensions,
    exports.getSuspensionRow,
    { users, roles }
  )
}

exports.getSuspensionRow = (suspension, { users, roles }) => {
  const username = users.find(user => user.id === suspension.userId).name
  const author = users.find(user => user.id === suspension.authorId)
  const role = roles.roles.find(role => role.rank === suspension.rank)
  const roleAbbreviation = role ? getAbbreviation(role.name) : 'Unknown'
  const rankBack = suspension.rankBack ? 'yes' : 'no'
  const dateString = getDate(new Date(suspension.date))
  const days = suspension.duration / 86400000
  let extensionDays = 0
  if (suspension.extensions) {
    for (const extension of suspension.extensions) {
      extensionDays += extension.duration / 86400000
    }
  }
  const extensionString = extensionDays < 0 ? ` (${extensionDays})` : extensionDays > 0 ? ` (+${extensionDays})` : ''

  return `**${username}** (${roleAbbreviation}, rankback **${rankBack}**) by **${author.name}** at **${dateString}** for **${days}${extensionString} ${pluralize('day', days + extensionDays)}** with reason:\n*${suspension.reason}*`
}

exports.groupTrainingsByType = trainings => {
  const result = {}
  for (const training of trainings) {
    if (!result[training.type.name]) {
      result[training.type.name] = []
    }
    result[training.type.name].push(training)
  }

  return result
}

exports.getTrainingTypes = async groupId => {
  return (await applicationAdapter('get', `/v1/groups/${groupId}/trainings/types`)).data
}

exports.getRoles = async groupId => {
  return (await applicationAdapter('get', `/v1/groups/${groupId}/roles`)).data
}

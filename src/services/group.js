'use strict'

const pluralize = require('pluralize')
const discordService = require('./discord')
const userService = require('../services/user')

const { applicationAdapter, robloxAdapter } = require('../adapters')
const { getDate, getTime, getTimeZoneAbbreviation } = require('../util').timeUtil
const { getAbbreviation } = require('../util').util

async function getGroup (groupId) {
  try {
    return (await robloxAdapter('GET', 'groups', `v1/groups/${groupId}`)).data
  } catch (err) {
    throw new Error('Invalid group.')
  }
}

async function getBanEmbeds (groupId, bans) {
  const userIds = [...new Set([
    ...bans.map(ban => ban.userId),
    ...bans.map(ban => ban.authorId)
  ])]
  const users = await userService.getUsers(userIds)
  const roles = await getRoles(groupId)

  return discordService.getListEmbeds(
    'Banlist',
    bans,
    getBanRow,
    { users, roles }
  )
}

function getBanRow ([, ban], { users, roles }) {
  const username = users.find(user => user.id === ban.userId).name
  const author = users.find(user => user.id === ban.authorId)
  const role = roles.roles.find(role => role.rank === ban.rank)
  const roleAbbreviation = role ? getAbbreviation(role.name) : 'unknown'
  const dateString = getDate(new Date(ban.date))

  return `**${username}**${role ? ' (' + roleAbbreviation + ')' : ''}${author ? ' by **' + author.name + '**' : ''}${dateString ? ' at **' + dateString + '**' : ''}${ban.reason ? ' with reason:\n*' + ban.reason + '*' : ''}`
}

async function getExileEmbeds (exiles) {
  const userIds = [...new Set([
    ...exiles.map(ban => ban.userId),
    ...exiles.map(ban => ban.authorId)
  ])]
  const users = await userService.getUsers(userIds)

  return discordService.getListEmbeds(
    'Current Exiles',
    exiles,
    getExileRow,
    { users }
  )
}

function getExileRow ([, exile], { users }) {
  const username = users.find(user => user.id === exile.userId).name
  const author = users.find(user => user.id === exile.authorId)
  const dateString = getDate(new Date(exile.date))

  return `**${username}**${author ? ' by **' + author.name + '**' : ''}${dateString ? ' at **' + dateString + '**' : ''}${exile.reason ? ' with reason:\n*' + exile.reason + '*' : ''}`
}

async function getSuspensionEmbeds (groupId, suspensions) {
  const userIds = [...new Set([
    ...suspensions.map(suspension => suspension.userId),
    ...suspensions.map(suspension => suspension.authorId)
  ])]
  const users = await userService.getUsers(userIds)
  const roles = await this.getRoles(groupId)

  return discordService.getListEmbeds(
    'Current Suspensions',
    suspensions,
    getSuspensionRow,
    { users, roles }
  )
}

function getSuspensionRow ([, suspension], { users, roles }) {
  const username = users.find(user => user.id === suspension.userId).name
  const author = users.find(user => user.id === suspension.authorId)
  const role = roles.roles.find(role => role.rank === suspension.rank)
  const roleAbbreviation = role ? getAbbreviation(role.name) : 'unknown'
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

  return `**${username}** (${roleAbbreviation}, rankBack **${rankBack}**) by **${author.name}** at **${dateString}** for **${days}${extensionString} ${pluralize('day', days + extensionDays)}** with reason:\n*${suspension.reason}*`
}

async function getTrainingEmbeds (trainings) {
  const userIds = [...new Set([
    ...trainings.map(training => training.authorId)
  ])]
  const users = await userService.getUsers(userIds)

  return discordService.getListEmbeds(
    'Upcoming Trainings',
    trainings,
    getTrainingRow,
    { users }
  )
}

function getTrainingRow ([, training], { users }) {
  const username = users.find(user => user.id === training.authorId).name
  const date = new Date(training.date)
  const readableDate = getDate(date)
  const readableTime = getTime(date)

  return `${training.id}. **${training.type.abbreviation}** training on **${readableDate}** at **${readableTime} ${getTimeZoneAbbreviation(date)}**, hosted by **${username}**.`
}

function groupTrainingsByType (trainings) {
  const result = {}
  for (const training of trainings) {
    if (!result[training.type.name]) {
      result[training.type.name] = []
    }
    result[training.type.name].push(training)
  }

  return result
}

async function getRoles (groupId) {
  return (await applicationAdapter('GET', `v1/groups/${groupId}/roles`)).data
}

async function getTrainingTypes (groupId) {
  return (await applicationAdapter('GET', `v1/groups/${groupId}/trainings/types`)).data
}

module.exports = {
  getGroup,
  getBanEmbeds,
  getBanRow,
  getExileEmbeds,
  getExileRow,
  getRoles,
  getSuspensionEmbeds,
  getSuspensionRow,
  getTrainingEmbeds,
  getTrainingRow,
  getTrainingTypes,
  groupTrainingsByType
}

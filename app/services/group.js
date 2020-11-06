'use strict'
const timeHelper = require('../helpers/time')
const userService = require('../services/user')
const pluralize = require('pluralize')
const lodash = require('lodash')
const discordService = require('./discord')

const applicationConfig = require('../../config/application')

const trainingTypes = { Conductor: [], 'Customer Service Representative': [] }

exports.getTrainingSentence = async training => {
  const role = training.type.toUpperCase()
  const date = new Date(training.date)
  const readableDate = timeHelper.getDate(date)
  const readableTime = timeHelper.getTime(date)
  return `**${role}** training on **${readableDate}** at **${readableTime} ${(timeHelper.isDst(date) && 'CEST') || 'CET'}**, hosted by **${(await userService.getUser(training.authorId)).name}**.`
}

exports.getRoleByAbbreviation = str => {
  if (str) {
    str = str.toUpperCase()
    /* eslint-disable no-mixed-operators */
    return str === 'G' && 'Guest' || str === 'C' && 'Customer' || str === 'S' && 'Suspended' || str === 'TD' &&
      'Train Driver' || str === 'CD' && 'Conductor' || str === 'CSR' && 'Customer Service Representative' || str ===
      'CS' && 'Customer Service' || str === 'LC' && 'Line Controller' || str === 'PR' && 'Partner Representative' ||
      str === 'R' && 'Representative' || str === 'MC' && 'Management Coordinator' || str === 'OC' &&
      'Operations Coordinator' || str === 'GA' && 'Group Admin' || str === 'M' && 'Management' || str === 'BoD' &&
      'Board of Directors' || str === 'CF' && 'Co-Founder' || str === 'AA' && 'Alt. Accounts' || str === 'PD' &&
      'President-Director' || str === 'UT' && 'Update Tester' || str === 'P' && 'Pending' || str === 'PH' &&
      'Pending HR' || str === 'HoCR' && 'Head of Customer Relations' || str === 'HoRS' && 'Head of Rolling Stock' ||
      str === 'HoS' && 'Head of Stations' || str === 'HoE' && 'Head of Events' || str === 'HoC' &&
      'Head of Conductors' || str === 'OD' && 'Operations Director' || str === 'SD' && 'Staff Director' || undefined
    /* eslint-enable no-mixed-operators */
  }
}

exports.getAbbreviationByRank = (rank, group) => {
  if (rank === 0) return 'G'
  if (!group || group === applicationConfig.groupId) {
    /* eslint-disable no-mixed-operators */
    return rank === 1 && 'C' || rank === 2 && 'S' || rank === 3 && 'TD' || rank === 4 && 'CD' || rank === 5 && 'CSR' ||
      rank === 99 && 'PR' || rank === 100 && 'R' || rank === 101 && 'SC' || rank === 102 && 'OC' || rank === 103 &&
      'GA' || rank === 251 && 'M' || rank === 252 && 'BoD' || rank === 253 && 'CF' || rank === 254 && 'AA' || rank ===
      255 && 'PD' || null
    /* eslint-enable no-mixed-operators */
  } else if (group === applicationConfig.mtGroupId) {
    /* eslint-disable no-mixed-operators */
    return rank === 2 && 'P' || rank === 50 && 'UT' || rank === 55 && 'LC' || rank === 100 && 'R' || rank === 101 &&
      'SC' || rank === 102 && 'OC' || rank === 199 && 'PHR' || rank === 244 && 'HoCR' || rank === 247 && 'HoS' ||
      rank === 246 && 'HoE' || rank === 249 && 'HoC' || rank === 250 && 'HoRM' || rank === 251 && 'SD' || rank ===
      252 && 'OD' || rank === 253 && 'GA' || rank === 254 && 'AA' || rank === 255 && 'PD'
    /* eslint-enable no-mixed-operators */
  }
}

exports.getTrainingEmbeds = async trainings => {
  return discordService.getListEmbeds('Upcoming Trainings', trainings, exports.getTrainingRow)
}

exports.getTrainingRow = async training => {
  return `${training.id}. ${await exports.getTrainingSentence(training)}`
}

exports.getSuspensionEmbeds = async suspensions => {
  const userIds = [...new Set([
    ...suspensions.map(suspension => suspension.userId),
    ...suspensions.map(suspension => suspension.authorId)
  ])]
  const users = await userService.getUsers(userIds)
  return discordService.getListEmbeds('Current Suspensions', suspensions, exports.getSuspensionRow, {
    users
  })
}

exports.getSuspensionRow = (suspension, { users }) => {
  const username = users.find(user => user.id === suspension.userId).name
  const author = users.find(user => user.id === suspension.authorId)
  const role = exports.getAbbreviationByRank(suspension.rank)
  const rankBack = suspension.rankBack ? 'yes' : 'no'
  const dateString = timeHelper.getDate(new Date(suspension.date))
  const days = suspension.duration / 86400000
  let extensionDays = 0
  if (suspension.extensions) {
    for (const extension of suspension.extensions) {
      extensionDays += extension.duration / 86400000
    }
  }
  const extensionString = extensionDays < 0 ? ` (${extensionDays})` : extensionDays > 0 ? ` (+${extensionDays})` : ''
  return `**${username}** (${role}, rankback **${rankBack}**) by **${author.name}** at **${dateString}** for **${days}${extensionString} ${pluralize('day', days + extensionDays)}** with reason:\n*${suspension.reason}*`
}

exports.groupTrainingsByType = trainings => {
  const result = {}
  for (const training of trainings) {
    const type = exports.getRoleByAbbreviation(training.type)
    if (!result[type]) {
      result[type] = []
    }
    result[type].push(training)
  }
  return lodash.assign({}, trainingTypes, result)
}

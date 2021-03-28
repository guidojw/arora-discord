'use strict'

const discordService = require('./discord')
const groupService = require('./group')
const userService = require('./user')

const { getDate } = require('../util').timeUtil
const { getAbbreviation } = require('../util').util

async function getBanEmbeds (groupId, bans) {
  const userIds = [...new Set([
    ...bans.map(ban => ban.userId),
    ...bans.map(ban => ban.authorId)
  ])]
  const users = await userService.getUsers(userIds)
  const roles = await groupService.getRoles(groupId)

  return discordService.getListEmbeds(
    'Banlist',
    bans,
    exports.getBanRow,
    { users, roles }
  )
}

function getBanRow (ban, { users, roles }) {
  const username = users.find(user => user.id === ban.userId).name
  const author = users.find(user => user.id === ban.authorId)
  const role = roles.roles.find(role => role.rank === ban.rank)
  const roleAbbreviation = role ? getAbbreviation(role.name) : 'Unknown'
  const dateString = getDate(new Date(ban.date))

  return `**${username}**${role ? ' (' + roleAbbreviation + ')' : ''}${author ? ' by **' + author.name + '**' : ''}${dateString ? ' at **' + dateString + '**' : ''}${ban.reason ? ' with reason:\n*' + ban.reason + '*' : ''}`
}

module.exports = {
  getBanEmbeds,
  getBanRow
}

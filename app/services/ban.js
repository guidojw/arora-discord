'use strict'
const userService = require('./user')
const groupService = require('./group')
const stringHelper = require('../helpers/string')
const timeHelper = require('../helpers/time')
const discordService = require('./discord')

const applicationConfig = require('../../config/application')

exports.getBanEmbeds = async bans => {
  const userIds = [...new Set([
    ...bans.map(ban => ban.userId),
    ...bans.map(ban => ban.authorId)
  ])]
  const users = await userService.getUsers(userIds)
  const roles = await groupService.getRoles(applicationConfig.groupId)

  return discordService.getListEmbeds('Banlist', bans, exports.getBanRow, { users, roles })
}

exports.getBanRow = (ban, { users, roles }) => {
  const username = users.find(user => user.id === ban.userId).name
  const author = users.find(user => user.id === ban.authorId)
  const role = roles.roles.find(role => role.rank === ban.rank)
  const roleAbbreviation = role ? stringHelper.getAbbreviation(role.name) : 'Unknown'
  const dateString = timeHelper.getDate(new Date(ban.date))

  return `**${username}**${role ? ' (' + roleAbbreviation + ')' : ''}${author ? ' by **' + author.name + '**' : ''}${dateString ? ' at **' + dateString + '**' : ''}${ban.reason ? ' with reason:\n*' + ban.reason + '*' : ''}`
}

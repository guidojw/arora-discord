'use strict'
const userService = require('./user')
const groupService = require('./group')
const timeHelper = require('../helpers/time')
const discordService = require('./discord')

const applicationConfig = require('../../config/application')

exports.getBanEmbeds = async bans => {
  const userIds = [...new Set([
    ...bans.map(ban => ban.userId),
    ...bans.map(ban => ban.authorId)
  ])]
  const users = await userService.getUsers(userIds)
  const roles  = await groupService.getRoles(applicationConfig.groupId)
  return discordService.getListEmbeds('Banlist', bans, exports.getBanRow, { users, roles })
}

exports.getBanRow = (ban, { users, roles }) => {
  const username = users.find(user => user.id === ban.userId).name
  const author = ban.authorId ? users.find(user => user.id === ban.authorId) : undefined
  const role = ban.rank ? roles.roles.find(role => role.rank === ban.rank) : undefined
  const dateString = ban.date ? timeHelper.getDate(new Date(ban.date)) : undefined
  return `**${username}**${role ? ' (' + role.name + ')' : ''}${author ? ' by **' + author.name + '**' : ''}${dateString ? ' at **' + dateString + '**' : ''}${ban.reason ? ' with reason:\n*' + ban.reason + '*' : ''}`
}

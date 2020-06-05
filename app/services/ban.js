'use strict'
const userService = require('./user')
const groupService = require('./group')
const timeHelper = require('../helpers/time')
const discordService = require('./discord')

exports.getBanEmbeds = async bans => {
    const userIds = [...new Set(bans.map(ban => ban.userId)), ...new Set(bans.map(ban => ban.authorId))]
    const users = await userService.getUsers(userIds)
    return discordService.getListEmbeds('Banlist', bans, exports.getBanRow, { users })
}

exports.getBanRow = (ban, { users }) => {
    const username = users.find(user => user.id === ban.userId).name
    const author = ban.authorId ? users.find(user => user.id === ban.authorId) : undefined
    const role = ban.rank ? groupService.getAbbreviationByRank(ban.rank) : undefined
    const dateString = ban.date ? timeHelper.getDate(new Date(ban.date)) : undefined
    return `**${username}**${role ? ' (' + role + ')' : ''}${author ? ' by **' + author.name + '**' : ''}${dateString ?
        ' at **' + dateString + '**' : ''}${ban.reason ? ' with reason:\n*' + ban.reason + '*' : ''}`
}

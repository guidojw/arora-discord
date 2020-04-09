'use strict'
const applicationAdapter = require('../adapters/application')

exports.getIdFromUsername = async username => {
    try {
        return (await applicationAdapter('get', `/v1/users/${username}/user-id`)).data
    } catch (err) {
        throw new Error(`**${username}** doesn't exist on Roblox.`)
    }
}

exports.hasBadge = async (userId, badgeId) => {
    return (await applicationAdapter('get', `/v1/users/${userId}/has-badge/${badgeId}`)).data
}

exports.getUsers = async userIds => {
    return (await applicationAdapter('post', '/v1/users', { userIds })).data
}

exports.getUser = async userId => {
    try {
        return (await applicationAdapter('get', `/v1/users/${userId}`)).data
    } catch (err) {
        throw new Error(`**${userId}** doesn't exist on Roblox.`)
    }
}

'use strict'
const applicationAdapter = require('../adapters/application')

const InputError = require('../errors/input-error')
const ApplicationError = require('../errors/application-error')

exports.getIdFromUsername = async username => {
    if (!username) throw new InputError('Please enter a username.')
    try {
        return (await applicationAdapter('get', `/v1/users/${username}/user-id`)).data
    } catch (err) {
        throw new ApplicationError(`**${username}** doesn't exist on Roblox.`)
    }
}

exports.hasBadge = async (userId, badgeId) => {
    return (await applicationAdapter('get', `/v1/users/${userId}/has-badge${badgeId}`)).data
}
'use strict'
const dataHelper = require('../helpers/data')

const applicationAdapter = require('../adapters/application')

exports.getIdFromUsername = async username => {
  const userId = (await applicationAdapter('get', `/v1/users/${username}/user-id`)).data
  if (!userId) {
    throw new Error(`**${username}** doesn't exist on Roblox.`)
  }
  return userId
}

exports.hasBadge = async (userId, badgeId) => {
  return (await applicationAdapter('get', `/v1/users/${userId}/has-badge/${badgeId}`)).data
}

exports.getUsers = async userIds => {
  if (userIds.length <= 100) {
    return (await applicationAdapter('post', '/v1/users', { userIds })).data
  } else {
    let result = []
    const chunks = dataHelper.split(userIds, 100)

    for (const chunk of chunks) {
      result = result.concat((await applicationAdapter('post', '/v1/users', { userIds: chunk }))
        .data)
    }

    return result
  }
}

exports.getUser = async userId => {
  try {
    return (await applicationAdapter('get', `/v1/users/${userId}`)).data
  } catch (err) {
    throw new Error(`**${userId}** doesn't exist on Roblox.`)
  }
}

exports.getRank = async (userId, groupId) => {
  return (await applicationAdapter('get', `/v1/users/${userId}/rank/${groupId}`)).data
}

exports.getRole = async (userId, groupId) => {
  return (await applicationAdapter('get', `/v1/users/${userId}/role/${groupId}`)).data
}

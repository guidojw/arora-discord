'use strict'

const { applicationAdapter } = require('../adapters')
const { split } = require('../util').util

async function getIdFromUsername (username) {
  const userId = (await applicationAdapter('get', `/v1/users/${encodeURIComponent(username)}/user-id`)).data
  if (!userId) { // Roblox returns HTTP 200 even when it didn't find anyone.
    throw new Error(`**${username}** doesn't exist on Roblox.`)
  }
  return userId
}

async function hasBadge (userId, badgeId) {
  return (await applicationAdapter('get', `/v1/users/${userId}/has-badge/${badgeId}`)).data
}

async function getUsers (userIds) {
  if (userIds.length <= 100) {
    return (await applicationAdapter('post', '/v1/users', { userIds })).data
  } else {
    let result = []
    const chunks = split(userIds, 100)

    for (const chunk of chunks) {
      result = result.concat((await applicationAdapter('post', '/v1/users', { userIds: chunk })).data)
    }

    return result
  }
}

async function getUser (userId) {
  try {
    return (await applicationAdapter('get', `/v1/users/${userId}`)).data
  } catch (err) {
    throw new Error(`**${userId}** doesn't exist on Roblox.`)
  }
}

async function getRank (userId, groupId) {
  return (await applicationAdapter('get', `/v1/users/${userId}/rank/${groupId}`)).data
}

async function getRole (userId, groupId) {
  return (await applicationAdapter('get', `/v1/users/${userId}/role/${groupId}`)).data
}

module.exports = {
  getIdFromUsername,
  getRank,
  getRole,
  getUser,
  getUsers,
  hasBadge
}

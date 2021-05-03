'use strict'

const { robloxAdapter } = require('../adapters')
const { split } = require('../util').util

async function getGroupsRoles (userId) {
  return (await robloxAdapter('GET', 'groups', `v1/users/${userId}/groups/roles`)).data.data
}

async function getIdFromUsername (username) {
  const userIds = (await robloxAdapter('POST', 'users', 'v1/usernames/users', {
    usernames: [username],
    excludeBannedUsers: false
  })).data.data
  if (!userIds?.[0]) {
    throw new Error(`**${username}** doesn't exist on Roblox.`)
  }
  return userIds[0].id
}

async function getUser (userId) {
  try {
    return (await robloxAdapter('GET', 'users', `v1/users/${userId}`)).data
  } catch (err) {
    throw new Error(`**${userId}** doesn't exist on Roblox.`)
  }
}

async function getUserOutfits (userId) {
  return (await robloxAdapter('GET', 'avatar', `v1/users/${userId}/outfits`)).data.data
}

async function getUsers (userIds) {
  let result = []
  const chunks = split(userIds, 100)
  for (const chunk of chunks) {
    result = result.concat((await robloxAdapter('POST', 'users', 'v1/users', {
      userIds: chunk,
      excludeBannedUsers: false
    })).data.data)
  }
  return result
}

module.exports = {
  getGroupsRoles,
  getIdFromUsername,
  getUser,
  getUserOutfits,
  getUsers
}

import type { GetUserById, GetUsersByUserIds, GetUsersByUsernames } from '@guidojw/bloxy/dist/client/apis/UsersAPI'
import type { GetUserOutfits as BloxyGetUserOutfits } from '@guidojw/bloxy/dist/client/apis/AvatarAPI'
import type { GetUserGroups } from '@guidojw/bloxy/dist/client/apis/GroupsAPI'
import { robloxAdapter } from '../adapters'
import { util } from '../utils'

export type GetUsers = GetUsersByUserIds['data']
export type GetGroupsRoles = GetUserGroups['data']
export type GetUserOutfits = BloxyGetUserOutfits['data']

const { split } = util

export async function getGroupsRoles (userId: number): Promise<GetGroupsRoles> {
  return (await robloxAdapter('GET', 'groups', `v1/users/${userId}/groups/roles`)).data.data
}

export async function getIdFromUsername (username: string): Promise<number> {
  const users: GetUsersByUsernames['data'] = (await robloxAdapter('POST', 'users', 'v1/usernames/users', {
    usernames: [username],
    excludeBannedUsers: false
  })).data.data
  if (typeof users?.[0] === 'undefined') {
    throw new Error(`**${username}** doesn't exist on Roblox.`)
  }
  return users[0].id
}

export async function getUser (userId: number): Promise<GetUserById> {
  try {
    return (await robloxAdapter('GET', 'users', `v1/users/${userId}`)).data
  } catch (err) {
    throw new Error(`**${userId}** doesn't exist on Roblox.`)
  }
}

export async function getUserOutfits (userId: number): Promise<GetUserOutfits> {
  return (await robloxAdapter('GET', 'avatar', `v1/users/${userId}/outfits`)).data.data
}

export async function getUsers (userIds: number[]): Promise<GetUsers> {
  let result: GetUsers = []
  const chunks = split(userIds, 100)
  for (const chunk of chunks) {
    result = result.concat((await robloxAdapter('POST', 'users', 'v1/users', {
      userIds: chunk,
      excludeBannedUsers: false
    })).data.data)
  }
  return result
}

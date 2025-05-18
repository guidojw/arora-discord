import type { GetUsersByUserIds, GetUsersByUsernames } from '@guidojw/bloxy/dist/client/apis/UsersAPI'
import { applicationAdapter, robloxAdapter } from '../adapters'
import type { GetUserOutfits as BloxyGetUserOutfits } from '@guidojw/bloxy/dist/client/apis/AvatarAPI'
import { util } from '../utils'

const { split } = util

export type GetUsers = GetUsersByUserIds['data']
export type GetUserOutfits = BloxyGetUserOutfits['data']

export interface GetUser {
  readonly path: string
  readonly createTime: string
  readonly id: string
  readonly name: string
  readonly displayName: string
  readonly about?: string
  readonly locale: string
  readonly premium: boolean
  readonly idVerified?: boolean
  readonly socialNetworkProfiles?: Record<string, string>
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

export async function getUsername (userId: number): Promise<string> {
  return (await getUser(userId)).name
}

export async function getUser (userId: number): Promise<GetUser> {
  try {
    return (await applicationAdapter('GET', `v2/users/${userId}`)).data
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

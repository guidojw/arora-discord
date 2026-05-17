import { applicationAdapter, robloxAdapter } from '../adapters'

export interface GetAccessToken {
  accessToken: string
  tokenType: string
  scope: string
}

export interface GetUserInfo {
  sub: string
  name: string
  nickname: string
  preferred_username: string
  created_at: number
  profile: string
  picture: string
}

export const robloxOAuthId = (userId: string): string => `discord:${userId}`

export async function getAuthorizationUrl (userId: string): Promise<string> {
  return (await applicationAdapter('POST', 'v1/oauth/roblox/verify', {
    id: robloxOAuthId(userId)
  })).data.authorizationUrl
}

export async function getAccessToken (userId: string): Promise<GetAccessToken> {
  return (await applicationAdapter('GET', 'v1/oauth/roblox/access-token', {
    id: robloxOAuthId(userId)
  })).data
}

export async function fetchUserInfo (userId: string): Promise<GetUserInfo> {
  const accessToken = await getAccessToken(userId)
  return (await robloxAdapter('GET', 'apis', 'oauth/v1/userinfo', undefined, {
    Authorization: `${accessToken.tokenType} ${accessToken.accessToken}`
  })).data
}

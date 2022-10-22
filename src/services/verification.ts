import { bloxlinkAdapter, roVerAdapter } from '../adapters'
import { VerificationProvider } from '../utils/constants'

export interface VerificationData {
  provider: VerificationProvider
  robloxId: number
  robloxUsername: string | null
}

export async function fetchVerificationData (
  userId: string,
  guildId?: string,
  verificationPreference = VerificationProvider.RoVer
): Promise<VerificationData | null> {
  let data = null
  let error
  if (typeof guildId !== 'undefined') {
    try {
      const fetch = verificationPreference === VerificationProvider.RoVer ? fetchRoVerData : fetchBloxlinkData
      data = await fetch(userId, guildId)
    } catch (err) {
      error = err
    }
  }
  if ((data ?? false) === false || typeof guildId !== 'undefined') {
    try {
      const fetch = verificationPreference === VerificationProvider.RoVer || typeof guildId === 'undefined'
        ? fetchBloxlinkData
        : fetchRoVerData
      data = await fetch(userId, guildId as string)
    } catch (err) {
      throw error ?? err
    }
  }
  if (typeof data === 'number') {
    data = {
      provider: VerificationProvider.Bloxlink,
      robloxId: data,
      robloxUsername: null
    }
  } else if (data !== null) {
    data = {
      provider: VerificationProvider.RoVer,
      ...data
    }
  }
  return data
}

async function fetchRoVerData (
  userId: string,
  guildId: string
): Promise<{ robloxUsername: string, robloxId: number } | null> {
  let response: { robloxUsername: string, robloxId: number }
  try {
    response = (await roVerAdapter('GET', `guilds/${guildId}/discord-to-roblox/${userId}`)).data
  } catch (err: any) {
    if (err.response?.status === 404) {
      return null
    }
    throw err.response?.data?.message ?? err
  }

  return {
    robloxUsername: response.robloxUsername,
    robloxId: response.robloxId
  }
}

async function fetchBloxlinkData (userId: string, guildId?: string): Promise<number | null> {
  const response = (await bloxlinkAdapter(
    'GET',
    `user/${userId}${typeof guildId !== 'undefined' ? `?guild=${guildId}` : ''}`
  )).data
  if (response.status === 'error') {
    if ((response.error as string).includes('not linked')) {
      return null
    }
    return response.status
  }

  return (response.matchingAccount !== null || response.primaryAccount !== null)
    ? parseInt(response.matchingAccount ?? response.primaryAccount)
    : null
}

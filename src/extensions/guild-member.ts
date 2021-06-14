import { Collection, GuildMember, Structures } from 'discord.js'
import { Command, CommandGroup } from 'discord.js-commando'
import { Member, Role } from '../models'
import { bloxlinkAdapter, roVerAdapter } from '../adapters'
import { VerificationProvider } from '../util/constants'

export interface VerificationData {
  provider: VerificationProvider
  robloxId: number
  robloxUsername: string | null
}

declare module 'discord.js' {
  interface GuildMember {
    verificationData: VerificationData | null
    readonly robloxId: number | null
    readonly robloxUsername: string | null

    canRunCommand (command: Command | CommandGroup): boolean
    fetchPersistentRoles (): Promise<Collection<string, Role>>
    persistRole (role: Role): Promise<this>
    unpersistRole (role: Role): Promise<this>
    fetchVerificationData (verificationPreference?: VerificationProvider): Promise<VerificationData | null>
  }
}

// @ts-expect-error
const AroraGuildMember: GuildMember = Structures.extend('GuildMember', GuildMember => (
  class AroraGuildMember extends GuildMember {
    public constructor (...args: any[]) {
      // @ts-expect-error
      super(...args)

      this.verificationData = null
    }

    public get robloxId (): number | null {
      return this.verificationData?.robloxId ?? null
    }

    public get robloxUsername (): string | null {
      return this.verificationData?.robloxUsername ?? null
    }

    public canRunCommand (command: Command | CommandGroup): boolean {
      let result = null
      const groupsChecked: string[] = []
      for (const role of this.roles.cache.values()) {
        for (const group of role.groups.cache.values()) {
          if (groupsChecked.includes(group.id)) {
            continue
          }
          result = group.permissionFor(command) ?? result
          if (result === false) {
            return false
          }
          groupsChecked.push(group.id)
        }
        result = role.permissionFor(command) ?? result
        if (result === false) {
          return false
        }
      }
      return result === true
    }

    public async fetchPersistentRoles (): Promise<Collection<string, Role>> {
      const data = await getData(this)

      return this.guild.roles.cache.filter(role => (
        data?.roles.some((persistentRole: { id: string }) => persistentRole.id === role.id) ?? false
      ))
    }

    public async persistRole (role: Role): Promise<this> {
      await this.roles.add(role)
      const [data] = await Member.findOrCreate({ where: { userId: this.id, guildId: this.guild.id } })
      await Role.findOrCreate({ where: { id: role.id, guildId: this.guild.id } })
      const added = typeof await data.addRole(role.id) !== 'undefined'

      if (!added) {
        throw new Error('Member does already have role.')
      } else {
        return this
      }
    }

    public async unpersistRole (role: Role): Promise<this> {
      const data = await getData(this)
      const removed = await data?.removeRole(role.id) === 1

      if (!removed) {
        throw new Error('Member does not have role.')
      } else {
        await this.roles.remove(role)
        return this
      }
    }

    public async fetchVerificationData (
      verificationPreference = this.guild.verificationPreference
    ): Promise<VerificationData | null> {
      if (this.verificationData?.provider === verificationPreference) {
        return this.verificationData
      }

      let data = null
      let error
      try {
        const fetch = verificationPreference === VerificationProvider.RoVer ? fetchRoVerData : fetchBloxlinkData
        data = await fetch(this.id, this.guild.id)
      } catch (err) {
        error = err
      }
      if ((data ?? false) === false) {
        try {
          const fetch = verificationPreference === VerificationProvider.RoVer ? fetchBloxlinkData : fetchRoVerData
          data = await fetch(this.id, this.guild.id)
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

      if (data === null || data.provider === this.guild.verificationPreference) {
        this.verificationData = data
      }
      return data
    }
  }
))

export default AroraGuildMember

async function getData (member: GuildMember): Promise<Member> {
  return Member.scope('withRoles').findOne({
    where: {
      userId: member.id,
      guildId: member.guild.id
    }
  })
}

async function fetchRoVerData (userId: string): Promise<{ robloxUsername: string, robloxId: number } | null> {
  let response
  try {
    response = (await roVerAdapter('GET', `user/${userId}`)).data
  } catch (err) {
    if (err.response?.data?.errorCode === 404) {
      return null
    }
    throw err.response?.data?.error ?? err
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

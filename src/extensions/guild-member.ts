import type { Collection, GuildMember } from 'discord.js'
import type { Command, CommandGroup } from 'discord.js-commando'
import type { Member as MemberEntity, Role as RoleEntity } from '../entities'
import { bloxlinkAdapter, roVerAdapter } from '../adapters'
import type { Repository } from 'typeorm'
import { Structures } from 'discord.js'
import { VerificationProvider } from '../util/constants'
import { constants } from '../util'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

export interface VerificationData {
  provider: VerificationProvider
  robloxId: number
  robloxUsername: string | null
}

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

declare module 'discord.js' {
  interface GuildMember {
    verificationData: VerificationData | null
    readonly robloxId: number | null
    readonly robloxUsername: string | null

    canRunCommand: (command: Command | CommandGroup) => boolean
    fetchPersistentRoles: () => Promise<Collection<string, Role>>
    persistRole: (role: Role) => Promise<this>
    unpersistRole: (role: Role) => Promise<this>
    fetchVerificationData: (verificationPreference?: VerificationProvider) => Promise<VerificationData | null>
  }
}

// @ts-expect-error
const AroraGuildMember: GuildMember = Structures.extend('GuildMember', GuildMember => {
  class AroraGuildMember extends GuildMember {
    @lazyInject(TYPES.MemberRepository)
    private readonly memberRepository!: Repository<MemberEntity>

    public constructor (...args: any[]) {
      // @ts-expect-error
      super(...args)

      this.verificationData = null
    }

    public override get robloxId (): number | null {
      return this.verificationData?.robloxId ?? null
    }

    public override get robloxUsername (): string | null {
      return this.verificationData?.robloxUsername ?? null
    }

    // @ts-expect-error
    public override canRunCommand (command: Command | CommandGroup): boolean {
      let result = null
      const groupsChecked: number[] = []
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

    // @ts-expect-error
    public override async fetchPersistentRoles (): Promise<Collection<string, Role>> {
      const data = await this.getData(this)

      return this.guild.roles.cache.filter(role => (
        data?.roles.some(persistentRole => persistentRole.id === role.id) === true
      ))
    }

    // @ts-expect-error
    public override async persistRole (role: Role): Promise<this> {
      await this.roles.add(role)
      const data = await this.getData(this) ?? await this.memberRepository.save(this.memberRepository.create({
        userId: this.id,
        guildId: this.guild.id
      }))
      if (typeof data.roles === 'undefined') {
        data.roles = []
      }

      if (data.roles.some(otherRole => otherRole.id === role.id)) {
        throw new Error('Member does already have role.')
      } else {
        data.roles.push({ id: role.id, guildId: this.guild.id })
        await this.memberRepository.save(data)
        return this
      }
    }

    // @ts-expect-error
    public override async unpersistRole (role: Role): Promise<this> {
      const data = await this.getData(this)

      if (typeof data === 'undefined' || !data?.roles.some(otherRole => otherRole.id === role.id)) {
        throw new Error('Member does not have role.')
      } else {
        data.roles = data.roles.filter(otherRole => otherRole.id !== role.id)
        await this.memberRepository.save(data)
        await this.roles.remove(role)
        return this
      }
    }

    // @ts-expect-error
    public override async fetchVerificationData (
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

    private async getData (member: GuildMember): Promise<(MemberEntity & { roles: RoleEntity[] }) | undefined> {
      return await this.memberRepository.findOne(
        { userId: member.id, guildId: member.guild.id },
        { relations: ['moderatingTickets', 'roles'] }
      ) as (MemberEntity & { roles: RoleEntity[] }) | undefined
    }
  }

  return AroraGuildMember
})

export default AroraGuildMember

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

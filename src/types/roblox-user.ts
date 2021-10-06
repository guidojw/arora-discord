import type { CommandInteraction, GuildMember } from 'discord.js'
import { userService, verificationService } from '../services'
import BaseArgumentType from './base'

export interface RobloxUser { id: number, username: string | null }

export default class RobloxUserArgumentType extends BaseArgumentType<RobloxUser> {
  protected readonly cache: Map<string, RobloxUser> = new Map()

  public async validate (
    value: string | undefined,
    interaction: CommandInteraction
  ): Promise<boolean> {
    if (typeof value === 'undefined') {
      const verificationData = await verificationService.fetchVerificationData(
        interaction.user.id,
        interaction.guildId ?? undefined
      )
      if (verificationData !== null) {
        this.setCache(interaction.id, verificationData.robloxId, verificationData.robloxUsername)
        return true
      }
      return false
    }

    const match = value.match(/^(?:<@!?)?([0-9]+)>?$/)
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (match !== null && interaction.inCachedGuild()) {
      try {
        const member = await interaction.guild.members.fetch(await interaction.client.users.fetch(match[1]))
        if (!member.user.bot) {
          const verificationData = await member.fetchVerificationData()
          if (verificationData !== null) {
            this.setCache(interaction.id, verificationData.robloxId, verificationData.robloxUsername)
            return true
          }
        }
      } catch {}

      const id = parseInt(match[0].match(/^(\d+)$/)?.[1] ?? '')
      if (!isNaN(id)) {
        try {
          const username = (await userService.getUser(id)).name
          this.setCache(interaction.id, id, username)
          return true
        } catch {}
      } else {
        return false
      }
    }

    const search = value.toLowerCase()
    const members = interaction.guild?.members.cache.filter(memberFilterExact(search))
    if (members?.size === 1) {
      const member = members.first()
      if (typeof member !== 'undefined' && !member.user.bot) {
        const verificationData = await member.fetchVerificationData()
        if (verificationData !== null) {
          this.setCache(interaction.id, verificationData.robloxId, verificationData.robloxUsername)
          return true
        }
      }
    }

    if (!search.includes(' ')) {
      try {
        const id = await userService.getIdFromUsername(search)
        this.setCache(interaction.id, id, search)
        return true
      } catch {}
    }
    return false
  }

  public parse (_value: string, interaction: CommandInteraction): RobloxUser | null {
    const result = this.cache.get(interaction.id)
    this.cache.delete(interaction.id)
    return result ?? null
  }

  private setCache (key: string, id: number, username: string | null): void {
    this.cache.set(key, { id, username })
  }
}

function memberFilterExact (search: string): (member: GuildMember) => boolean {
  return (member: GuildMember) => member.user.username.toLowerCase() === search ||
    (member.nickname !== null && member.nickname.toLowerCase() === search) ||
    `${member.user.username.toLowerCase()}#${member.user.discriminator}` === search
}

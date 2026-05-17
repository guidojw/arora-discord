import type { ChatInputCommandInteraction, GuildMember } from 'discord.js'
import { oAuthService, userService } from '../services'
import BaseArgumentType from './base'
import axios from 'axios'
import { injectable } from 'inversify'

export interface RobloxUser { id: number, username: string | null }

@injectable()
export default class RobloxUserArgumentType extends BaseArgumentType<RobloxUser> {
  private readonly cache = new Map<string, RobloxUser>()

  public async validate (
    val: string,
    interaction: ChatInputCommandInteraction
  ): Promise<boolean | string> {
    if (val === 'self') {
      try {
        const userInfo = await oAuthService.fetchUserInfo(interaction.user.id)
        this.setCache(interaction.id, parseInt(userInfo.sub), userInfo.preferred_username)
        return true
      } catch (err) {
        if (axios.isAxiosError(err) && typeof err.response !== 'undefined' && err.response.status === 404) {
          return 'Could not get user info, please `/verify`'
        }
        throw err
      }
    }

    const match = val.match(/^(?:<@!?)?([0-9]+)>?$/)
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (match !== null) {
      if (interaction.inCachedGuild()) {
        try {
          const member = await interaction.guild.members.fetch(await interaction.client.users.fetch(match[1]))
          if (!member.user.bot) {
            try {
              const userInfo = await oAuthService.fetchUserInfo(member.id)
              this.setCache(interaction.id, parseInt(userInfo.sub), userInfo.preferred_username)
              return true
            } catch (err) {
              if (member.id === interaction.user.id && axios.isAxiosError(err) && typeof err.response !== 'undefined' &&
                err.response.status === 404) {
                return 'Could not get user info, please `/verify`'
              }
              throw err
            }
          }
        } catch {}
      }

      const id = parseInt(match[0].match(/^(\d+)$/)?.[1] ?? '')
      if (!isNaN(id)) {
        try {
          const username = await userService.getUsername(id)
          this.setCache(interaction.id, id, username)
          return true
        } catch {}
      } else {
        return false
      }
    }

    const search = val.toLowerCase()
    if (interaction.inCachedGuild()) {
      const members = interaction.guild.members.cache.filter(memberFilterExact(search))
      if (members.size === 1) {
        const member = members.first()
        if (typeof member !== 'undefined' && !member.user.bot) {
          try {
            const userInfo = await oAuthService.fetchUserInfo(member.id)
            this.setCache(interaction.id, parseInt(userInfo.sub), userInfo.preferred_username)
            return true
          } catch {}
        }
      }
    }

    if (!/\s/.test(val)) {
      try {
        const id = await userService.getIdFromUsername(search)
        this.setCache(interaction.id, id, search)
        return true
      } catch {}
    }
    return false
  }

  public parse (_val: string, interaction: ChatInputCommandInteraction): RobloxUser | null {
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

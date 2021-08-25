import type { Collection, GuildMember } from 'discord.js'
import type BaseHandler from '../../base'
import type Client from '../../client'
import { injectable } from 'inversify'
import { userService } from '../../../services'

interface RankChangePacket {
  groupId: number
  userId: number
  rank: number
}

@injectable()
export default class RankChangePacketHandler implements BaseHandler {
  public async handle (client: Client, { data }: { data: RankChangePacket }): Promise<void> {
    const { groupId, userId, rank } = data
    const username = (await userService.getUser(userId)).name
    for (const guild of client.guilds.cache.values()) {
      if (guild.robloxGroupId === groupId) {
        const roleBindings = guild.roleBindings.cache
        if (roleBindings.size > 0) {
          const members = await guild.members.fetch(username) as unknown as Collection<string, GuildMember>
          if (members.size > 0) {
            for (const roleBinding of roleBindings.values()) {
              if (rank === roleBinding.min ||
                (roleBinding.max !== null && rank >= roleBinding.min && rank <= roleBinding.max)) {
                await Promise.all(members.map(async member => await member.roles.add(roleBinding.roleId)))
              } else {
                await Promise.all(members.map(async member => await member.roles.remove(roleBinding.roleId)))
              }
            }
          }
        }
      }
    }
  }
}

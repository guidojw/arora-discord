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
    for (const context of client.guildContexts.cache.values()) {
      if (context.robloxGroupId === groupId) {
        const roleBindings = await context.roleBindings.fetch()
        if (roleBindings.size > 0) {
          const members = await context.fetchMembersByRobloxUsername(username)
          if (members.size > 0) {
            for (const roleBinding of roleBindings.values()) {
              if (
                rank === roleBinding.min ||
                (roleBinding.max !== null && rank >= roleBinding.min && rank <= roleBinding.max)
              ) {
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

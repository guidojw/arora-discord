import type { GuildMember, Role } from 'discord.js'
import type BaseHandler from '../base'
import type Client from '../client'
import { injectable } from 'inversify'

@injectable()
export default class GuildMemberUpdateEventHandler implements BaseHandler {
  public async handle (_client: Client, oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (newMember.user.bot) {
      return
    }

    if (oldMember.roles.cache.size > newMember.roles.cache.size) {
      const removedRole = oldMember.roles.cache.find(role => !newMember.roles.cache.has(role.id)) as Role
      const persistentRoles = await newMember.fetchPersistentRoles()
      if (persistentRoles.has(removedRole.id)) {
        await newMember.unpersistRole(removedRole)
      }
    }
  }
}

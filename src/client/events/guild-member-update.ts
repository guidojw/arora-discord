import type { GuildMember, Role } from 'discord.js'
import { inject, injectable } from 'inversify'
import type BaseHandler from '../base'
import type Client from '../client'
import type { PersistentRoleService } from '../../services'
import { constants } from '../../utils'

const { TYPES } = constants

@injectable()
export default class GuildMemberUpdateEventHandler implements BaseHandler {
  @inject(TYPES.PersistentRoleService)
  private readonly persistentRoleService!: PersistentRoleService

  public async handle (_client: Client, oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (newMember.user.bot) {
      return
    }

    if (oldMember.roles.cache.size > newMember.roles.cache.size) {
      const removedRole = oldMember.roles.cache.find(role => !newMember.roles.cache.has(role.id)) as Role
      const persistentRoles = await this.persistentRoleService.fetchPersistentRoles(newMember)
      if (persistentRoles.has(removedRole.id)) {
        await this.persistentRoleService.unpersistRole(newMember, removedRole)
      }
    }
  }
}

import { inject, injectable } from 'inversify'
import type BaseHandler from '../base'
import type Client from '../client'
import type { Role as DiscordRole } from 'discord.js'
import type { Repository } from 'typeorm'
import type { Role } from '../../entities'
import { constants } from '../../util'

const { TYPES } = constants

@injectable()
export default class RoleDeleteEventHandler implements BaseHandler {
  @inject(TYPES.RoleRepository) private readonly roleRepository!: Repository<Role>

  public async handle (_client: Client, role: DiscordRole): Promise<void> {
    await this.roleRepository.delete(role.id)
  }
}

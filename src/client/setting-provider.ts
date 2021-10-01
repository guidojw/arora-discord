import type {
  Guild as GuildEntity,
  Role as RoleEntity,
  RoleMessage as RoleMessageEntity,
  Tag as TagEntity
} from '../entities'
import type Client from './client'
import type { Repository } from 'typeorm'
import type { Snowflake } from 'discord.js'
import { constants } from '../util'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

export default class SettingProvider {
  @lazyInject(TYPES.GuildRepository)
  private readonly guildRepository!: Repository<GuildEntity>

  @lazyInject(TYPES.RoleRepository)
  private readonly roleRepository!: Repository<RoleEntity>

  @lazyInject(TYPES.RoleMessageRepository)
  private readonly roleMessageRepository!: Repository<RoleMessageEntity>

  @lazyInject(TYPES.TagRepository)
  private readonly tagRepository!: Repository<TagEntity>

  private client!: Client

  public async init (client: Client): Promise<void> {
    this.client = client

    for (const guildId of client.guilds.cache.keys()) {
      await this.setupGuild(guildId)
    }
    await this.setupGuild('0') // global settings
  }

  // @ts-expect-error
  public override async setupGuild (guildId: Snowflake): Promise<void> {
    const guild = this.client.guilds.resolve(guildId)
    const data = await this.guildRepository.findOne(
      guildId,
      {
        relations: [
          'groups',
          'groups.channels',
          'groups.permissions',
          'groups.roles',
          'guildCommands',
          'guildCommands.command',
          'panels',
          'panels.message',
          // See "Band-aid fix" below.
          // 'roles',
          // 'roles.permissions',
          // 'roleBindings', // moved to RoleBindingManager.fetch
          // 'roleMessages',
          // 'roleMessages.message',
          // 'tags',
          // 'tags.names',
          'tickets',
          'tickets.moderators',
          'tickets.author',
          'ticketTypes',
          'ticketTypes.message'
        ]
      }
    ) ?? await this.guildRepository.save(this.guildRepository.create({ id: guildId }))
    if (typeof data.guildCommands === 'undefined') {
      data.guildCommands = []
    }

    // Band-aid fix. idk why, but somehow after merging
    // https://github.com/guidojw/nsadmin-discord/pull/164 the bot's memory
    // usage raised rapidly on start up and kept causing numerous out of memory
    // errors. I tried several things and it seems to be pg related.
    // Removing includes from the relations somehow fixed the issue.
    if (guild !== null) {
      data.roles = await this.roleRepository.find({ where: { guildId: guild.id }, relations: ['permissions'] })
      data.roleMessages = await this.roleMessageRepository.find({
        where: { guildId: guild.id },
        relations: ['message']
      })
      data.tags = await this.tagRepository.find({ where: { guildId: guild.id }, relations: ['names'] })
      // Remove more from the relations and put it here if above error returns..
    }

    if (guild !== null) {
      guild.setup(data)
      await guild.init()
    }
  }
}

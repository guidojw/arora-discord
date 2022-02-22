import type {
  Guild as GuildEntity,
  Role as RoleEntity,
  RoleMessage as RoleMessageEntity,
  Tag as TagEntity
} from '../entities'
import type AroraClient from './client'
import type { Guild } from 'discord.js'
import type { Repository } from 'typeorm'
import { constants } from '../utils'
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

  public async init (client: AroraClient): Promise<void> {
    await Promise.all(client.guilds.cache.map(async guild => await this.setupGuild(guild)))
  }

  // @ts-expect-error
  public override async setupGuild (guild: Guild): Promise<void> {
    const data = await this.guildRepository.findOne(
      guild.id,
      {
        relations: [
          'groups',
          'groups.channels',
          'groups.roles',
          'panels',
          'panels.message',
          // See "Band-aid fix" below.
          // 'roles',
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
    ) ?? await this.guildRepository.save(this.guildRepository.create({ id: guild.id }))

    // Band-aid fix. idk why, but somehow after merging
    // https://github.com/guidojw/arora-discord/pull/164 the bot's memory
    // usage raised rapidly on start up and kept causing numerous out of memory
    // errors. I tried several things, and it seems to be pg related.
    // Removing includes from the relations somehow fixed the issue.
    data.roles = await this.roleRepository.find({ where: { guildId: guild.id } })
    data.roleMessages = await this.roleMessageRepository.find({ where: { guildId: guild.id }, relations: ['message'] })
    data.tags = await this.tagRepository.find({ where: { guildId: guild.id }, relations: ['names'] })
    // Remove more from the relations and put it here if above error returns..

    // @ts-expect-error
    const context = guild.client.guildContexts._add(data, true, { id: data.id, extras: [guild] })
    await context.init()
  }
}

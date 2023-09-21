import type {
  Guild as GuildEntity,
  Role as RoleEntity,
  RoleMessage as RoleMessageEntity,
  Tag as TagEntity
} from '../entities'
import { inject, injectable, named } from 'inversify'
import type { AroraClient } from '.'
import type { Guild } from 'discord.js'
import { GuildContextManager } from '../managers'
import { Repository } from 'typeorm'
import { constants } from '../utils'

const { TYPES } = constants

@injectable()
export default class SettingProvider {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  @inject(TYPES.GuildRepository)
  private readonly guildRepository!: Repository<GuildEntity>

  @inject(TYPES.RoleRepository)
  private readonly roleRepository!: Repository<RoleEntity>

  @inject(TYPES.RoleMessageRepository)
  private readonly roleMessageRepository!: Repository<RoleMessageEntity>

  @inject(TYPES.TagRepository)
  private readonly tagRepository!: Repository<TagEntity>

  public async init (client: AroraClient): Promise<void> {
    await Promise.all(client.guilds.cache.map(async guild => {
      await this.setupGuild(guild)
    }))
  }

  public async setupGuild (guild: Guild): Promise<void> {
    const data = await this.guildRepository.findOne({
      where: { id: guild.id },
      relations: {
        groups: {
          channels: true,
          roles: true
        },
        panels: {
          message: true
        },
        // See "Band-aid fix" below.
        // roles: true,
        // roleBindings: true, // moved to RoleBindingManager.fetch
        // roleMessages: {
        //   message: true
        // },
        // tags: {
        //   names: true
        // },
        tickets: {
          moderators: true,
          author: true
        },
        ticketTypes: {
          message: true
        }
      }
    }) ?? await this.guildRepository.save(this.guildRepository.create({ id: guild.id }))

    // Band-aid fix. idk why, but somehow after merging
    // https://github.com/guidojw/arora-discord/pull/164 the bot's memory
    // usage raised rapidly on start up and kept causing numerous out of memory
    // errors. I tried several things, and it seems to be pg related.
    // Removing includes from the relations somehow fixed the issue.
    data.roles = await this.roleRepository.find({ where: { guildId: guild.id } })
    data.roleMessages = await this.roleMessageRepository.find({
      where: { guildId: guild.id },
      relations: { message: true }
    })
    data.tags = await this.tagRepository.find({
      where: { guildId: guild.id },
      relations: { names: true }
    })
    // Remove more from the relations and put it here if above error returns..

    const context = this.guildContexts.add(data, { id: data.id, extras: [guild] })
    await context.init()
  }
}

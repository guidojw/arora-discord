import { CategoryChannel, Guild, TextChannel } from 'discord.js'
import { GuildContext, type GuildUpdateOptions } from '../structures'
import { inject, injectable } from 'inversify'
import { DataManager } from './base'
import type { Guild as GuildEntity } from '../entities'
import { Repository } from 'typeorm'
import { constants } from '../utils'

const { TYPES } = constants

export type GuildContextResolvable = GuildContext | Guild | string

@injectable()
export default class GuildContextManager extends DataManager<
string,
GuildContext,
GuildContextResolvable,
GuildEntity
> {
  @inject(TYPES.GuildRepository)
  private readonly guildRepository!: Repository<GuildEntity>

  public constructor () {
    super(GuildContext)
  }

  public async update (
    contextResolvable: GuildContextResolvable,
    data: GuildUpdateOptions
  ): Promise<GuildContext> {
    const context = this.resolve(contextResolvable)
    if (context === null) {
      throw new Error('Invalid guild context.')
    }
    if (!this.cache.has(context.id)) {
      throw new Error('Guild context not found.')
    }

    const changes: Partial<GuildEntity> = {}
    if (typeof data.logsChannel !== 'undefined') {
      let channel
      if (data.logsChannel !== null) {
        channel = context.guild.channels.resolve(data.logsChannel)
        if (channel === null || !(channel instanceof TextChannel)) {
          throw new Error('Invalid channel.')
        }
      }
      changes.logsChannelId = channel?.id ?? null
    }
    if (typeof data.primaryColor !== 'undefined') {
      changes.primaryColor = data.primaryColor
    }
    if (typeof data.ratingsChannel !== 'undefined') {
      let channel
      if (data.ratingsChannel !== null) {
        channel = context.guild.channels.resolve(data.ratingsChannel)
        if (channel === null || !(channel instanceof TextChannel)) {
          throw new Error('Invalid channel.')
        }
      }
      changes.ratingsChannelId = channel?.id ?? null
    }
    if (typeof data.robloxGroup !== 'undefined') {
      changes.robloxGroupId = data.robloxGroup
    }
    if (typeof data.robloxUsernamesInNicknames !== 'undefined') {
      changes.robloxUsernamesInNicknames = data.robloxUsernamesInNicknames
    }
    if (typeof data.suggestionsChannel !== 'undefined') {
      let channel
      if (data.suggestionsChannel !== null) {
        channel = context.guild.channels.resolve(data.suggestionsChannel)
        if (channel === null || !(channel instanceof TextChannel)) {
          throw new Error('Invalid channel.')
        }
      }
      changes.suggestionsChannelId = channel?.id ?? null
    }
    if (typeof data.supportEnabled !== 'undefined') {
      changes.supportEnabled = data.supportEnabled
    }
    if (typeof data.ticketArchivesChannel !== 'undefined') {
      let channel
      if (data.ticketArchivesChannel !== null) {
        channel = context.guild.channels.resolve(data.ticketArchivesChannel)
        if (channel === null || !(channel instanceof TextChannel)) {
          throw new Error('Invalid channel.')
        }
      }
      changes.ticketArchivesChannelId = channel?.id ?? null
    }
    if (typeof data.ticketsCategory !== 'undefined') {
      let channel
      if (data.ticketsCategory !== null) {
        channel = context.guild.channels.resolve(data.ticketsCategory)
        if (channel === null || !(channel instanceof CategoryChannel)) {
          throw new Error('Invalid channel.')
        }
      }
      changes.ticketsCategoryId = channel?.id ?? null
    }
    if (typeof data.verificationPreference !== 'undefined') {
      changes.verificationPreference = data.verificationPreference
    }

    await this.guildRepository.save(this.guildRepository.create({
      ...changes,
      id: context.id
    }))
    const newData = await this.guildRepository.findOneBy({ id: context.id }) as GuildEntity

    const _context = this.cache.get(context.id)
    _context?.setup(newData)
    return _context ?? this.add(newData)
  }

  public override resolve (guildContext: GuildContext): GuildContext
  public override resolve (guildContext: GuildContextResolvable): GuildContext | null
  public override resolve (guildContext: GuildContextResolvable): GuildContext | null {
    if (guildContext instanceof Guild) {
      return this.cache.find(otherGuildContext => otherGuildContext.id === guildContext.id) ?? null
    }
    return super.resolve(guildContext)
  }

  public override resolveId (guildContext: string): string
  public override resolveId (guildContext: GuildContextResolvable): string | null
  public override resolveId (guildContext: GuildContextResolvable): string | null {
    if (guildContext instanceof Guild) {
      return guildContext.id
    }
    return super.resolveId(guildContext)
  }
}

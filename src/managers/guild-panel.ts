import { type Guild, MessageEmbed } from 'discord.js'
import { Panel, type PanelUpdateOptions } from '../structures'
import BaseManager from './base'
import type { Panel as PanelEntity } from '../entities'
import { Repository } from 'typeorm'
import type { TextChannelResolvable } from './guild-ticket'
import { constants } from '../util'
import container from '../configs/container'
import { discordService } from '../services'
import getDecorators from 'inversify-inject-decorators'

export type PanelResolvable = string | Panel | number

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

export default class GuildPanelManager extends BaseManager<Panel, PanelResolvable> {
  @lazyInject(TYPES.PanelRepository)
  private readonly panelRepository!: Repository<PanelEntity>

  public readonly guild: Guild

  public constructor (guild: Guild, iterable?: Iterable<PanelEntity>) {
    // @ts-expect-error
    super(guild.client, iterable, Panel)

    this.guild = guild
  }

  public override add (data: PanelEntity, cache = true): Panel {
    return super.add(data, cache, { id: data.id, extras: [this.guild] })
  }

  public async create (name: string, content: object): Promise<Panel> {
    if (this.resolve(name) !== null) {
      throw new Error('A panel with that name already exists.')
    }
    const embed = new MessageEmbed(content)
    const valid = discordService.validateEmbed(embed)
    if (typeof valid === 'string') {
      throw new Error(valid)
    }

    const newData = await this.panelRepository.save(this.panelRepository.create({
      content: JSON.stringify(embed.toJSON()),
      guildId: this.guild.id,
      name
    }))

    return this.add(newData)
  }

  public async delete (panel: PanelResolvable): Promise<void> {
    const id = this.resolveID(panel)
    if (id === null) {
      throw new Error('Invalid panel.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Panel not found.')
    }

    await this.panelRepository.delete(id)
    this.cache.delete(id)
  }

  public async update (
    panelResolvable: PanelResolvable,
    data: PanelUpdateOptions
  ): Promise<Panel> {
    const panel = this.resolve(panelResolvable)
    if (panel === null) {
      throw new Error('Invalid panel.')
    }
    if (!this.cache.has(panel.id)) {
      throw new Error('Panel not found.')
    }

    const changes: Partial<PanelEntity> = {}
    const options: { channelId?: string, guildId?: string } = {}
    if (typeof data.name !== 'undefined') {
      if (this.resolve(data.name) !== null) {
        throw new Error('A panel with that name already exists.')
      }
      changes.name = data.name
    }
    if (typeof data.content !== 'undefined') {
      const embed = new MessageEmbed(data.content)
      const valid = discordService.validateEmbed(embed)
      if (typeof valid === 'string') {
        throw new Error(valid)
      }
      changes.content = JSON.stringify(embed.toJSON())

      if (panel.message !== null) {
        if (panel.message.partial) {
          await panel.message.fetch()
        }
        await panel.message.edit(embed)
      }
    }
    if (typeof data.message !== 'undefined') {
      const message = data.message
      try {
        if (message.partial) {
          await message.fetch()
        }
      } catch {
        throw new Error('Invalid message.')
      }
      if (message.author.id !== this.client.user?.id) {
        throw new Error(`Can only update message to messages posted by ${this.client.user?.toString() ?? 'Arora'}.`)
      }
      if (this.cache.some(otherPanel => otherPanel.messageId === message.id)) {
        throw new Error('Another panel is already posted in that message.')
      }
      changes.messageId = message.id
      options.channelId = message.channel.id
      options.guildId = this.guild.id

      await message.edit('', panel.embed)
    }

    await this.panelRepository.save(this.panelRepository.create({
      id: panel.id,
      ...changes
    }), {
      data: options
    })
    const newData = await this.panelRepository.findOne(
      panel.id,
      { relations: ['message'] }
    ) as PanelEntity

    const _panel = this.cache.get(panel.id)
    _panel?.setup(newData)
    return _panel ?? this.add(newData, false)
  }

  public async post (panelResolvable: PanelResolvable, channelResolvable?: TextChannelResolvable): Promise<Panel> {
    const panel = this.resolve(panelResolvable)
    if (panel === null) {
      throw new Error('Invalid panel.')
    }
    if (!this.cache.has(panel.id)) {
      throw new Error('Panel not found.')
    }
    let channel
    if (typeof channelResolvable !== 'undefined') {
      channel = this.guild.channels.resolve(channelResolvable)
      if (channel === null || !channel.isText()) {
        throw new Error('Invalid channel.')
      }
    }

    const data: { messageId: null | string } = {
      messageId: null
    }
    if (typeof channel !== 'undefined') {
      const message = await channel.send(panel.embed)
      data.messageId = message.id
    }
    await this.panelRepository.save(this.panelRepository.create({
      id: panel.id,
      ...data
    }), {
      data: {
        channelId: channel?.id ?? null,
        guildId: this.guild.id
      }
    })
    const newData = await this.panelRepository.findOne(
      panel.id,
      { relations: ['message'] }
    ) as PanelEntity

    const _panel = this.cache.get(panel.id)
    _panel?.setup(newData)
    return _panel ?? this.add(newData, false)
  }

  public override resolve (panel: PanelResolvable): Panel | null {
    if (typeof panel === 'string') {
      panel = panel.toLowerCase()
      return this.cache.find(otherPanel => otherPanel.name.toLowerCase() === panel) ?? null
    }
    return super.resolve(panel)
  }

  public override resolveID (panel: PanelResolvable): number | null {
    if (typeof panel === 'string') {
      panel = panel.toLowerCase()
      return this.cache.find(otherPanel => otherPanel.name.toLowerCase() === panel)?.id ?? null
    }
    return super.resolveID(panel)
  }
}

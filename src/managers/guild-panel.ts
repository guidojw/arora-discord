import { ChannelType, EmbedBuilder, type TextChannelResolvable } from 'discord.js'
import { type GuildContext, Panel, type PanelUpdateOptions } from '../structures'
import { inject, injectable } from 'inversify'
import { AroraClient } from '../client'
import { DataManager } from './base'
import type { Panel as PanelEntity } from '../entities'
import { Repository } from 'typeorm'
import { constants } from '../utils'
import { discordService } from '../services'

const { TYPES } = constants

export type PanelResolvable = string | Panel | number

@injectable()
export default class GuildPanelManager extends DataManager<number, Panel, PanelResolvable, PanelEntity> {
  @inject(TYPES.Client)
  private readonly client!: AroraClient<true>

  @inject(TYPES.PanelRepository)
  private readonly panelRepository!: Repository<PanelEntity>

  public context!: GuildContext

  public constructor () {
    super(Panel)
  }

  public override setOptions (context: GuildContext): void {
    this.context = context
  }

  public override add (data: PanelEntity): Panel {
    return super.add(data, { id: data.id, extras: [this.context] })
  }

  public async create (name: string, content: object): Promise<Panel> {
    if (this.resolve(name) !== null) {
      throw new Error('A panel with that name already exists.')
    }
    const embed = new EmbedBuilder(content)
    const valid = discordService.validateEmbed(embed)
    if (typeof valid === 'string') {
      throw new Error(valid)
    }

    const newData = await this.panelRepository.save(this.panelRepository.create({
      content: JSON.stringify(embed.toJSON()),
      guildId: this.context.id,
      name
    }))

    return this.add(newData)
  }

  public async delete (panel: PanelResolvable): Promise<void> {
    const id = this.resolveId(panel)
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
      const embed = new EmbedBuilder(data.content)
      const valid = discordService.validateEmbed(embed)
      if (typeof valid === 'string') {
        throw new Error(valid)
      }
      changes.content = JSON.stringify(embed.toJSON())

      if (panel.message !== null) {
        if (panel.message.partial) {
          await panel.message.fetch()
        }
        await panel.message.edit({ embeds: [embed] })
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
      if (message.author.id !== this.client.user.id) {
        throw new Error(`Can only update message to messages posted by ${this.client.user.toString()}.`)
      }
      if (this.cache.some(otherPanel => otherPanel.messageId === message.id)) {
        throw new Error('Another panel is already posted in that message.')
      }
      changes.messageId = message.id
      options.channelId = message.channel.id
      options.guildId = this.context.id

      await message.edit({ content: null, embeds: [panel.embed] })
    }

    await this.panelRepository.save(this.panelRepository.create({
      ...changes,
      id: panel.id
    }), {
      data: options
    })
    const newData = await this.panelRepository.findOne({
      where: { id: panel.id },
      relations: { message: true }
    }) as PanelEntity

    const _panel = this.cache.get(panel.id)
    _panel?.setup(newData)
    return _panel ?? this.add(newData)
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
      channel = this.context.guild.channels.resolve(channelResolvable)
      if (channel === null || channel.type !== ChannelType.GuildText) {
        throw new Error('Invalid channel.')
      }
    }

    const data: { messageId: null | string } = {
      messageId: null
    }
    if (typeof channel !== 'undefined') {
      const message = await channel.send({ embeds: [panel.embed] })
      data.messageId = message.id
    }
    await this.panelRepository.save(this.panelRepository.create({
      ...data,
      id: panel.id
    }), {
      data: {
        channelId: channel?.id ?? null,
        guildId: this.context.id
      }
    })
    const newData = await this.panelRepository.findOne({
      where: { id: panel.id },
      relations: { message: true }
    }) as PanelEntity

    const _panel = this.cache.get(panel.id)
    _panel?.setup(newData)
    return _panel ?? this.add(newData)
  }

  public override resolve (panel: Panel): Panel
  public override resolve (panel: PanelResolvable): Panel | null
  public override resolve (panel: PanelResolvable): Panel | null {
    if (typeof panel === 'string') {
      panel = panel.toLowerCase()
      return this.cache.find(otherPanel => otherPanel.name.toLowerCase() === panel) ?? null
    }
    return super.resolve(panel)
  }

  public override resolveId (panel: number): number
  public override resolveId (panel: PanelResolvable): number | null
  public override resolveId (panel: PanelResolvable): number | null {
    if (typeof panel === 'string') {
      return this.resolve(panel)?.id ?? null
    }
    return super.resolveId(panel)
  }
}

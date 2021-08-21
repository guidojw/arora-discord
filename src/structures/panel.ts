import type { Client, Guild, Message, MessageEmbedOptions, TextChannel } from 'discord.js'
import BaseStructure from './base'
import { MessageEmbed } from 'discord.js'
import type { Panel as PanelEntity } from '../entities'
import Postable from './mixins/postable'

export interface PanelUpdateOptions { name?: string, content?: MessageEmbedOptions, message?: Message }

export default class Panel extends Postable(BaseStructure) {
  public readonly guild: Guild
  public id!: number
  public name!: string
  public content!: string
  public messageId!: string | null
  public channelId!: string | null

  public constructor (client: Client, data: PanelEntity, guild: Guild) {
    super(client)

    this.guild = guild

    this.setup(data)
  }

  public setup (data: PanelEntity): void {
    this.id = data.id
    this.name = data.name
    this.content = data.content
    this.messageId = data.message?.id ?? null
    this.channelId = data.message?.channelId ?? null
  }

  public get embed (): MessageEmbed {
    return new MessageEmbed(JSON.parse(this.content))
  }

  public async update (data: PanelUpdateOptions): Promise<Panel> {
    return await this.guild.panels.update(this, data)
  }

  public async delete (): Promise<void> {
    return await this.guild.panels.delete(this)
  }

  public async post (channel: TextChannel): Promise<Panel> {
    return await this.guild.panels.post(this, channel)
  }

  public override toString (): string {
    return this.name
  }
}
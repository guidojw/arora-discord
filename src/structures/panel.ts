import type { Guild, TextChannel } from 'discord.js'
import BaseStructure from './base'
import type Client from '../client/client'
import { MessageEmbed } from 'discord.js'
import type { Panel as PanelEntity } from '../entities'
import Postable from './mixins/postable'

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

  public override toString (): string {
    return this.name
  }

  public async update (data: Partial<PanelEntity>): Promise<this> {
    return await this.guild.panels.update(this, data)
  }

  public async delete (): Promise<void> {
    return await this.guild.panels.delete(this)
  }

  public async post (channel: TextChannel): Promise<this> {
    return await this.guild.panels.post(this, channel)
  }
}

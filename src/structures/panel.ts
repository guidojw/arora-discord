import { EmbedBuilder, type Message, type TextChannel } from 'discord.js'
import type { AbstractConstructor } from '../utils'
import BaseStructure from './base'
import type { GuildContext } from '.'
import type { Panel as PanelEntity } from '../entities'
import { Postable } from './mixins'
import { injectable } from 'inversify'

export interface PanelUpdateOptions { name?: string, content?: object, message?: Message }

@injectable()
export default class Panel extends Postable<
AbstractConstructor<BaseStructure<PanelEntity>>,
PanelEntity
>(BaseStructure) {
  public context!: GuildContext

  public id!: number
  public name!: string
  public content!: string
  public messageId!: string | null
  public channelId!: string | null

  public constructor () {
    super()
  }

  public setOptions (data: PanelEntity, context: GuildContext): void {
    this.context = context

    this.setup(data)
  }

  public setup (data: PanelEntity): void {
    this.id = data.id
    this.name = data.name
    this.content = data.content
    this.messageId = data.message?.id ?? null
    this.channelId = data.message?.channelId ?? null
  }

  public get embed (): EmbedBuilder {
    return new EmbedBuilder(JSON.parse(this.content))
  }

  public async update (data: PanelUpdateOptions): Promise<Panel> {
    return await this.context.panels.update(this, data)
  }

  public async delete (): Promise<void> {
    await this.context.panels.delete(this)
  }

  public async post (channel: TextChannel): Promise<Panel> {
    return await this.context.panels.post(this, channel)
  }

  public override toString (): string {
    return this.name
  }
}

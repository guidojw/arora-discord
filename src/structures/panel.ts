import { Guild, MessageEmbed, TextChannel } from 'discord.js'
import BaseStructure from './base'
import Client from '../client/client'
import Postable from './mixins/postable'

export default class Panel extends Postable(BaseStructure) {
  public readonly guild: Guild
  public id!: string
  public name!: string
  public content!: string
  public messageId!: string | null
  public channelId!: string | null

  public constructor (client: Client, data: any, guild: Guild) {
    super(client)

    this.guild = guild

    this.setup(data)
  }

  public setup (data: any): void {
    super.setup(data)

    this.id = data.id
    this.name = data.name
    this.content = data.content
  }

  public get embed (): MessageEmbed {
    return new MessageEmbed(JSON.parse(this.content))
  }

  public toString (): string {
    return this.name
  }

  public update (data: any): this {
    return this.guild.panels.update(this, data)
  }

  public delete (): void {
    return this.guild.panels.delete(this)
  }

  public post (channel: TextChannel): this {
    return this.guild.panels.post(this, channel)
  }
}

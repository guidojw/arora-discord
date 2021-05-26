import { Guild, MessageEmbed, TextChannel } from 'discord.js'
import BaseStructure from './base'
import { CommandoClient } from 'discord.js-commando'
import Postable from './mixins/postable'

export default class Panel extends Postable implements BaseStructure {
  id!: string
  name!: string
  content!: string
  messageId!: string | null
  channelId!: string | null

  constructor (client: CommandoClient, data: any, guild: Guild) {
    super(client, data, guild)

    this.setup(data)
  }

  setup (data: any): void {
    super.setup(data)

    this.id = data.id
    this.name = data.name
    this.content = data.content
  }

  get embed (): MessageEmbed {
    return new MessageEmbed(JSON.parse(this.content))
  }

  toString (): string {
    return this.name
  }

  update (data: any): this {
    return this.guild.panels.update(this, data)
  }

  delete (): void {
    return this.guild.panels.delete(this)
  }

  post (channel: TextChannel): this {
    return this.guild.panels.post(this, channel)
  }
}

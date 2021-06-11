import { Constants, Base as DiscordBaseStructure, Guild, GuildChannel, Message } from 'discord.js'
import BaseStructure from '../base'
import { Constructor } from '../../util/util'

const { PartialTypes } = Constants

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Postable<T extends Constructor<BaseStructure> | Constructor<DiscordBaseStructure>> (Base: T) {
  abstract class Postable extends Base {
    abstract readonly guild: Guild
    messageId!: string | null
    channelId!: string | null

    setup (data: any): void {
      super.setup?.(data)

      this.messageId = data.message?.id ?? null
      this.channelId = data.message?.channelId ?? null
    }

    get channel (): GuildChannel | null {
      return this.channelId !== null ? this.guild.channels.cache.get(this.channelId) ?? null : null
    }

    get message (): Message | null {
      return this.messageId !== null && this.channel !== null && this.channel.isText()
        ? this.channel.messages.cache.get(this.messageId) ??
        (super.client.options.partials?.includes(PartialTypes.MESSAGE) === true
          ? this.channel.messages.add({ id: this.messageId })
          : null)
        : null
    }
  }

  return Postable
}

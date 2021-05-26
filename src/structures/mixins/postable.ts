import { Constants, Guild, GuildChannel, Message } from 'discord.js'
import { CommandoClient } from 'discord.js-commando'
import { Constructor } from '../../util/util'

const { PartialTypes } = Constants

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Postable<T extends Constructor<any>> (Base: T) {
  return class extends Base {
    messageId!: string | null
    channelId!: string | null

    setup (data: any): void {
      this.messageId = data.message?.id ?? null
      this.channelId = data.message?.channelId ?? null
    }

    get channel (): GuildChannel | null {
      return this.channelId !== null ? this.guild.channels.cache.get(this.channelId) ?? null : null
    }

    get message (): Message | null {
      return this.messageId !== null && this.channel !== null && this.channel.isText()
        ? this.channel.messages.cache.get(this.messageId) ??
        (this.client.options.partials?.includes(PartialTypes.MESSAGE) === true
          ? this.channel.messages.add({ id: this.messageId })
          : null)
        : null
    }
  }
}

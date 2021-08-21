import type { AbstractConstructor, Constructor, Mixin } from '../../util/util'
import type { Base as DiscordBaseStructure, Guild, Message, TextChannel } from 'discord.js'
import type BaseStructure from '../base'
import { Constants } from 'discord.js'

const { PartialTypes } = Constants

export type PostableType = Mixin<typeof Postable>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Postable<T extends AbstractConstructor<BaseStructure> | Constructor<DiscordBaseStructure>> (
  base: T
) {
  abstract class Postable extends base {
    public abstract readonly guild: Guild
    public abstract messageId: string | null
    public abstract channelId: string | null

    public get channel (): TextChannel | null {
      return this.channelId !== null
        ? (this.guild.channels.cache.get(this.channelId) as TextChannel | undefined) ?? null
        : null
    }

    public get message (): Message | null {
      return this.messageId !== null && this.channel !== null
        ? this.channel.messages.cache.get(this.messageId) ??
        (super.client.options.partials?.includes(PartialTypes.MESSAGE) === true
          ? this.channel.messages.add({ id: this.messageId })
          : null)
        : null
    }
  }

  return Postable
}
import { type AbstractConstructor, type Mixin, constants } from '../../utils'
import type { BaseStructure, GuildContext } from '..'
import { Constants, type Message, type TextChannel } from 'discord.js'
import { inject, injectable } from 'inversify'
import type { AroraClient } from '../../client'
import type { IdentifiableEntity } from '../../entities'

const { PartialTypes } = Constants
const { TYPES } = constants

export type PostableType = Mixin<typeof Postable>

export abstract class PostableProperties {
  public abstract readonly context: GuildContext

  public abstract messageId: string | null
  public abstract channelId: string | null

  public readonly channel!: TextChannel | null
  public readonly message!: Message | null
}

export default function Postable<T extends AbstractConstructor<BaseStructure<U>>, U extends IdentifiableEntity> (
  base: T
): AbstractConstructor<PostableProperties> & T {
  @injectable()
  abstract class Postable extends base {
    @inject(TYPES.Client)
    private readonly client!: AroraClient<true>

    public abstract readonly context: GuildContext

    public abstract messageId: string | null
    public abstract channelId: string | null

    public get channel (): TextChannel | null {
      return this.channelId !== null
        ? (this.context.guild.channels.cache.get(this.channelId) as TextChannel | undefined) ?? null
        : null
    }

    public get message (): Message | null {
      return this.messageId !== null && this.channel !== null
        ? this.channel.messages.cache.get(this.messageId) ??
        (this.client.options.partials?.includes(PartialTypes.MESSAGE) === true
          // @ts-expect-error
          ? this.channel.messages._add({ id: this.messageId, channel_id: this.channelId })
          : null)
        : null
    }
  }

  return Postable
}

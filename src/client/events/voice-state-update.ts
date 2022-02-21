import { inject, injectable } from 'inversify'
import type BaseHandler from '../base'
import type { ChannelLinkService } from '../../services'
import type Client from '../client'
import type { VoiceState } from 'discord.js'
import { constants } from '../../utils'

const { TYPES } = constants

@injectable()
export default class VoiceStateUpdateEventHandler implements BaseHandler {
  @inject(TYPES.ChannelLinkService)
  private readonly channelLinkService!: ChannelLinkService

  public async handle (_client: Client, oldState: VoiceState, newState: VoiceState): Promise<void> {
    if (oldState.channelId !== newState.channelId) {
      const member = newState.member
      if (member === null) {
        return
      }

      if (oldState.channel !== null) {
        const toLinks = await this.channelLinkService.fetchToLinks(oldState.channel)
        await Promise.all(toLinks.map(async channel => {
          try {
            await channel.permissionOverwrites.cache.get(member.id)?.delete()
          } catch {}
        }))
      }

      if (newState.channel !== null) {
        const toLinks = await this.channelLinkService.fetchToLinks(newState.channel)
        await Promise.all(toLinks.map(async channel => {
          try {
            await channel.permissionOverwrites.edit(member, {
              VIEW_CHANNEL: true,
              SEND_MESSAGES: true
            })
          } catch {}
        }))
      }
    }
  }
}

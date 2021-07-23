import type BaseHandler from '../base'
import type Client from '../client'
import type { VoiceState } from 'discord.js'
import { injectable } from 'inversify'

@injectable()
export default class VoiceStateUpdateEventHandler implements BaseHandler {
  public async handle (_client: Client, oldState: VoiceState, newState: VoiceState): Promise<void> {
    if (oldState.channelID !== newState.channelID) {
      const member = newState.member
      if (member === null) {
        return
      }

      if (oldState.channel !== null) {
        const toLinks = await oldState.channel.fetchToLinks()
        toLinks.forEach(channel => {
          try {
            channel.permissionOverwrites.get(member.id)?.delete()
          } catch {}
        })
      }

      if (newState.channel !== null) {
        const toLinks = await newState.channel.fetchToLinks()
        toLinks.map(async (channel) => {
          try {
            await channel.updateOverwrite(member, {
              VIEW_CHANNEL: true,
              SEND_MESSAGES: true
            })
          } catch {}
        })
      }
    }
  }
}

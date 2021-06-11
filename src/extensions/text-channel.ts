import { Structures, TextChannel } from 'discord.js'
import { TextChannelGroupManager } from '../managers'

declare module 'discord.js' {
  export interface TextChannel {
    groups: TextChannelGroupManager
  }
}

// @ts-expect-error
const AroraTextChannel: TextChannel = Structures.extend('TextChannel', TextChannel => (
  class AroraTextChannel extends TextChannel {
    get groups (): TextChannelGroupManager {
      return new TextChannelGroupManager(this)
    }
  }
))

export default AroraTextChannel

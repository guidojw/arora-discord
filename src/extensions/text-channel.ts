import { Structures, type TextChannel } from 'discord.js'
import { TextChannelGroupManager } from '../managers'

declare module 'discord.js' {
  interface TextChannel {
    groups: TextChannelGroupManager
  }
}

// @ts-expect-error
const AroraTextChannel: TextChannel = Structures.extend('TextChannel', TextChannel => (
  class AroraTextChannel extends TextChannel {
    public override get groups (): TextChannelGroupManager {
      return new TextChannelGroupManager(this)
    }
  }
))

export default AroraTextChannel

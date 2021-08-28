import BaseArgumentType from './base'
import { ChannelGroup } from '../structures'
import type { CommandoClient } from 'discord.js-commando'

export default class ChannelGroupArgumentType extends BaseArgumentType<ChannelGroup> {
  public constructor (client: CommandoClient) {
    super(client, ChannelGroup, 'groups')
  }
}

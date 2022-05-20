import type { CommandInteraction, Message } from 'discord.js'
import BaseArgumentType from './base'
import { injectable } from 'inversify'

const messageUrlRegex = /^https:\/\/discord.com\/channels\/([0-9]+|@me)\/[0-9]+\/[0-9]+$/
const endpointUrl = 'https://discord.com/channels/'

@injectable()
export default class MessageArgumentType extends BaseArgumentType<Message> {
  public async validate (value: string, interaction: CommandInteraction): Promise<boolean> {
    const match = value.match(messageUrlRegex)
    if (match === null) {
      return false
    }
    const [guildId, channelId, messageId] = match[0]
      .replace(endpointUrl, '')
      .split('/')
    const channel = guildId === interaction.guildId && interaction.inCachedGuild()
      ? interaction.guild.channels.resolve(channelId)
      : guildId === '@me'
        ? interaction.channel
        : null
    if (channel === null || !channel.isText()) {
      return false
    }
    try {
      return typeof await channel.messages.fetch(messageId) !== 'undefined'
    } catch {
      return false
    }
  }

  public parse (value: string, interaction: CommandInteraction): Message | null {
    const match = value.match(messageUrlRegex)
    if (match === null) {
      return null
    }
    const [guildId, channelId, messageId] = match[0]
      .replace(endpointUrl, '')
      .split('/')
    const channel = guildId === interaction.guildId && interaction.inCachedGuild()
      ? interaction.guild.channels.resolve(channelId)
      : guildId === '@me'
        ? interaction.channel
        : null
    if (channel === null || !channel.isText()) {
      return null
    }
    return channel.messages.resolve(messageId)
  }
}

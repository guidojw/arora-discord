import { type CommandInteraction, TextChannel } from 'discord.js'
import BaseArgumentType from './base'
import { injectable } from 'inversify'

@injectable()
export default class TextChannelArgumentType extends BaseArgumentType<TextChannel> {
  public validate (value: string, interaction: CommandInteraction): boolean {
    if (!interaction.inCachedGuild()) {
      return false
    }

    const match = value.match(/(\d+)/)
    if (match === null) {
      return false
    }
    const channel = interaction.guild.channels.resolve(match[0])
    return channel !== null && channel instanceof TextChannel
  }

  public parse (value: string, interaction: CommandInteraction): TextChannel | null {
    if (!interaction.inCachedGuild()) {
      return null
    }

    const match = value.match(/(\d+)/)
    if (match === null) {
      return null
    }
    const channel = interaction.guild.channels.resolve(match[0])
    return channel instanceof TextChannel ? channel : null
  }
}

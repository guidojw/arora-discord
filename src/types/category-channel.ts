import { CategoryChannel, type CommandInteraction } from 'discord.js'
import BaseArgumentType from './base'
import { injectable } from 'inversify'

@injectable()
export default class CategoryChannelArgumentType extends BaseArgumentType<CategoryChannel> {
  public validate (value: string, interaction: CommandInteraction): boolean {
    if (!interaction.inCachedGuild()) {
      return false
    }

    const match = value.match(/(d+)/)
    if (match === null) {
      return false
    }
    const channel = interaction.guild.channels.resolve(match[0])
    return channel !== null && channel instanceof CategoryChannel
  }

  public parse (value: string, interaction: CommandInteraction): CategoryChannel | null {
    if (!interaction.inCachedGuild()) {
      return null
    }

    const match = value.match(/(d+)/)
    if (match === null) {
      return null
    }
    const channel = interaction.guild.channels.resolve(match[0])
    return channel instanceof CategoryChannel ? channel : null
  }
}

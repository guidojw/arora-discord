import type { ChatInputCommandInteraction, GuildEmoji } from 'discord.js'
import BaseArgumentType from './base'
import { injectable } from 'inversify'

@injectable()
export default class CustomEmojiArgumentType extends BaseArgumentType<GuildEmoji> {
  public validate (value: string, interaction: ChatInputCommandInteraction): boolean {
    const match = value.match(/^(?:<a?:([a-zA-Z0-9_]+):)?([0-9]+)>?$/)
    if (match !== null && interaction.client.emojis.cache.has(match[2])) {
      return true
    }
    if (!interaction.inCachedGuild()) {
      return false
    }
    const search = value.toLowerCase()
    const emojis = interaction.guild.emojis.cache.filter(this.filterInexact(search))
    if (emojis.size === 1) {
      return true
    }
    const exactEmojis = interaction.guild.emojis.cache.filter(this.filterExact(search))
    return exactEmojis.size === 1
  }

  public parse (value: string, interaction: ChatInputCommandInteraction): GuildEmoji | null {
    const match = value.match(/^(?:<a?:([a-zA-Z0-9_]+):)?([0-9]+)>?$/)
    if (match !== null) {
      return interaction.client.emojis.cache.get(match[2]) ?? null
    }
    if (!interaction.inCachedGuild()) {
      return null
    }
    const search = value.toLowerCase()
    const emojis = interaction.guild.emojis.cache.filter(this.filterInexact(search))
    if (emojis.size === 0) {
      return null
    }
    if (emojis.size === 1) {
      return emojis.first() as GuildEmoji
    }
    const exactEmojis = interaction.guild.emojis.cache.filter(this.filterExact(search))
    if (exactEmojis.size === 1) {
      return exactEmojis.first() as GuildEmoji
    }
    return null
  }

  private filterExact (search: string): (structure: GuildEmoji) => boolean {
    return structure => structure.name?.toLowerCase() === search
  }

  private filterInexact (search: string): (structure: GuildEmoji) => boolean {
    return structure => structure.name?.toLowerCase().includes(search) ?? false
  }
}

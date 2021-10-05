import type { CommandInteraction } from 'discord.js'

export default interface BaseCommand {
  ownerOwnly?: boolean

  requiresApi?: boolean
  requiresRobloxGroup?: boolean
  requiresSingleGuild?: boolean

  execute: (interaction: CommandInteraction) => Promise<void>
}

import type { ArgumentOptions } from '../commands'
import type { CommandInteraction } from 'discord.js'

export default abstract class BaseArgumentType<T> {
  public abstract validate (
    value: string,
    interaction: CommandInteraction,
    arg: ArgumentOptions
  ): boolean | string | Promise<boolean | string>

  public abstract parse (
    value: string,
    interaction: CommandInteraction,
    arg: ArgumentOptions
  ): T | null | Promise<T | null>
}

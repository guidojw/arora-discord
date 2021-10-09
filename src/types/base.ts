import type { Argument } from '../commands'
import type { CommandInteraction } from 'discord.js'

export default abstract class BaseArgumentType<T> {
  public abstract validate (
    value: string,
    interaction: CommandInteraction,
    arg: Argument<T>
  ): boolean | string | Promise<boolean | string>

  public abstract parse (
    value: string,
    interaction: CommandInteraction,
    arg: Argument<T>
  ): T | null | Promise<T | null>
}

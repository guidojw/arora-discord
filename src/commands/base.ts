import type { AroraClient as Client } from '../client'
import type { CommandInteraction } from 'discord.js'
import type { KeyOfType } from '../util/util'

export interface ArgumentOptions {
  key: string
  name?: string
  type?: string
  required?: boolean
  default?: string
}

export type SubCommandOptions = {
  args: ArgumentOptions[]
} | true

interface BaseCommandOptions {
  ownerOwnly?: boolean
  requiresApi?: boolean
  requiresRobloxGroup?: boolean
  requiresSingleGuild?: boolean
}

export interface CommandOptions extends BaseCommandOptions {
  command?: SubCommandOptions
}

export interface SubCommandCommandOptions<T extends SubCommandCommand<any>> extends BaseCommandOptions {
  subcommands: { [K in Exclude<KeyOfType<T, Function>, 'execute'>]?: SubCommandOptions }
}

export default abstract class BaseCommand<T extends CommandOptions = BaseCommandOptions> {
  public readonly client: Client
  public readonly options: T

  public constructor (client: Client<true>, options: T) {
    this.client = client
    this.options = options
  }
}

export abstract class Command extends BaseCommand<CommandOptions> {
  public abstract execute (
    interaction: CommandInteraction,
    args: Record<string, any>
  ): Promise<void>
}

export class SubCommandCommand<T extends SubCommandCommand<any>> extends BaseCommand<SubCommandCommandOptions<T>> {
  public async execute (
    interaction: CommandInteraction,
    subcommand: string,
    args: Record<string, any>
  ): Promise<void> {
    const fn = this[subcommand as keyof this]
    if (typeof fn === 'function') {
      return await Promise.resolve(fn(interaction, args))
    } else {
      throw new Error(`Subcommand "${subcommand.toString()}" does not exist.`)
    }
  }
}

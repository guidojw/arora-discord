import Argument from './argument'
import type { ArgumentOptions } from './argument'
import type { AroraClient } from '../client'
import type { CommandInteraction } from 'discord.js'
import type { KeyOfType } from '../util/util'

export type SubCommandOptions = {
  args: Array<ArgumentOptions<any>>
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
  public readonly client: AroraClient
  public readonly options: T

  protected constructor (client: AroraClient<true>, options: T) {
    this.client = client
    this.options = options
  }
}

export abstract class Command extends BaseCommand<CommandOptions> {
  public readonly args: Record<string, Argument<any>> = {}

  public constructor (client: AroraClient<true>, options: CommandOptions) {
    super(client, options)

    if (typeof options.command !== 'undefined' && options.command !== true) {
      for (const argumentOptions of options.command.args) {
        this.args[argumentOptions.key] = new Argument<any>(client, argumentOptions)
      }
    }
  }

  public abstract execute (
    interaction: CommandInteraction,
    args: Record<string, any>
  ): Promise<void>
}

export class SubCommandCommand<T extends SubCommandCommand<any>> extends BaseCommand<SubCommandCommandOptions<T>> {
  public readonly args: Record<string, Record<string, Argument<any>>> = {}

  public constructor (client: AroraClient<true>, options: SubCommandCommandOptions<T>) {
    super(client, options)

    for (const [subcommandName, subcommand] of Object.entries(options.subcommands as
      Record<string, SubCommandOptions>)) {
      if (subcommand === true) {
        continue
      }

      this.args[subcommandName] = {}
      for (const argumentOptions of subcommand.args) {
        this.args[subcommandName][argumentOptions.key] = new Argument<any>(client, argumentOptions)
      }
    }
  }

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

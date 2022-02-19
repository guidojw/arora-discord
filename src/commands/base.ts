import Argument, { type ArgumentOptions } from './argument'
import type { AroraClient } from '../client'
import type { CommandInteraction } from 'discord.js'
import type { KeyOfType } from '../util/util'

interface BaseCommandOptions {
  ownerOwnly?: boolean
  requiresApi?: boolean
  requiresRobloxGroup?: boolean
  requiresSingleGuild?: boolean
}

type SubCommandOptions = {
  args: Array<ArgumentOptions<any>>
} | true

export interface CommandOptions extends BaseCommandOptions {
  command?: SubCommandOptions
}

export interface SubCommandCommandOptions<T extends SubCommandCommand<any>> extends BaseCommandOptions {
  subCommands: {
    [K in Exclude<KeyOfType<T, Function>, 'execute'>]?: Parameters<T[K]>[1] extends string
      ? Record<Parameters<T[K]>[1], SubCommandOptions>
      : SubCommandOptions
  }
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

  public constructor (client: AroraClient<true>, options?: CommandOptions) {
    super(client, options ?? {})

    if (typeof options?.command !== 'undefined' && options.command !== true) {
      for (const argumentOptions of options.command.args) {
        this.args[argumentOptions.name ?? argumentOptions.key] = new Argument<any>(client, argumentOptions)
      }
    }
  }

  public abstract execute (
    interaction: CommandInteraction,
    args: Record<string, any>
  ): Promise<void>
}

export class SubCommandCommand<T extends SubCommandCommand<any>> extends BaseCommand<SubCommandCommandOptions<T>> {
  public readonly args: Record<string, Record<string, Argument<any> | Record<string, Argument<any>>>> = {}

  public constructor (client: AroraClient<true>, options: SubCommandCommandOptions<T>) {
    super(client, options)

    for (const [subCommandName, subCommand] of
      Object.entries<SubCommandOptions | Record<string, SubCommandOptions> | undefined>(options.subCommands)) {
      if (typeof subCommand === 'undefined' || subCommand === true) {
        continue
      }

      this.args[subCommandName] = {}
      if (Reflect.has(subCommand, 'args')) {
        for (const argumentOptions of (subCommand as Exclude<SubCommandOptions, true>).args) {
          this.args[subCommandName][argumentOptions.name ?? argumentOptions.key] =
            new Argument<any>(client, argumentOptions)
        }
      } else {
        for (const [subSubCommandName, subSubCommand] of
          Object.entries<SubCommandOptions>(subCommand as Record<string, SubCommandOptions>)) {
          if (subSubCommand === true) {
            continue
          }

          const subSubCommandArgs = (this.args[subCommandName][subSubCommandName] = {}) as Record<string, Argument<any>>
          for (const argumentOptions of subSubCommand.args) {
            subSubCommandArgs[argumentOptions.name ?? argumentOptions.key] = new Argument<any>(client, argumentOptions)
          }
        }
      }
    }
  }

  public async execute (
    interaction: CommandInteraction,
    subCommandName: string,
    args: Record<string, any>
  ): Promise<void>
  public async execute (
    interaction: CommandInteraction,
    subCommandGroupName: string,
    subCommandName: string,
    args: Record<string, any>
  ): Promise<void>
  public async execute (
    interaction: CommandInteraction,
    subCommandNameOrSubCommandGroupName: string,
    argsOrSubCommandName: string | Record<string, any>,
    args?: Record<string, any>
  ): Promise<void> {
    const fn = this[subCommandNameOrSubCommandGroupName as keyof this]
    if (typeof fn === 'function') {
      return await Promise.resolve(fn(interaction, argsOrSubCommandName, args))
    } else {
      throw new Error(`Subcommand "${subCommandNameOrSubCommandGroupName.toString()}" does not exist.`)
    }
  }
}

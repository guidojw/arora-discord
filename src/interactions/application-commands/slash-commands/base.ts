import { type AnyFunction, type KeyOfType, type OverloadedParameters, constants } from '../../../utils'
import type { Argument, ArgumentOptions } from '.'
import { inject, injectable } from 'inversify'
import type { AroraClient } from '../../../client'
import type { CommandInteraction } from 'discord.js'

const { TYPES } = constants

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

type SubCommandNames<T, U = OverloadedParameters<T>> = {
  [K in keyof U as U[K] extends any[] ? K : never]: U[K] extends any[] ? U[K][1] : never
}

export interface SubCommandCommandOptions<T extends SubCommandCommand<any>> extends BaseCommandOptions {
  subCommands: {
    [K in Exclude<KeyOfType<T, AnyFunction>, 'setOptions' | 'execute'>]: T[K] extends AnyFunction
      ? Parameters<T[K]>[1] extends string
        ? { [U in keyof SubCommandNames<T[K]> as SubCommandNames<T[K]>[U]]: SubCommandOptions }
        : SubCommandOptions
      : never
  }
}

export default abstract class BaseCommand<T extends CommandOptions = BaseCommandOptions> {
  @inject(TYPES.Client)
  protected readonly client!: AroraClient

  @inject(TYPES.ArgumentFactory)
  protected readonly argumentFactory!: (options: ArgumentOptions<any>) => Argument<any>

  public options!: T

  public setOptions (options: T): void {
    this.options = options
  }
}

@injectable()
export abstract class Command extends BaseCommand<CommandOptions> {
  public readonly args: Record<string, Argument<any>> = {}

  public override setOptions (options?: CommandOptions): void {
    super.setOptions(options ?? {})

    if (typeof this.options?.command !== 'undefined' && this.options.command !== true) {
      for (const argumentOptions of this.options.command.args) {
        this.args[argumentOptions.name ?? argumentOptions.key] = this.argumentFactory(argumentOptions)
      }
    }
  }

  public abstract execute (
    interaction: CommandInteraction,
    args: Record<string, any>
  ): Promise<void>
}

@injectable()
export class SubCommandCommand<T extends SubCommandCommand<any>> extends BaseCommand<SubCommandCommandOptions<T>> {
  public readonly args: Record<string, Record<string, Argument<any> | Record<string, Argument<any>>>> = {}

  public override setOptions (options: SubCommandCommandOptions<T>): void {
    super.setOptions(options)

    for (const [subCommandName, subCommand] of
      Object.entries<SubCommandOptions | Record<string, SubCommandOptions> | undefined>(this.options.subCommands)) {
      if (typeof subCommand === 'undefined' || subCommand === true) {
        continue
      }

      this.args[subCommandName] = {}
      if (Reflect.has(subCommand, 'args')) {
        for (const argumentOptions of (subCommand as Exclude<SubCommandOptions, true>).args) {
          this.args[subCommandName][argumentOptions.name ?? argumentOptions.key] = this.argumentFactory(argumentOptions)
        }
      } else {
        for (const [subSubCommandName, subSubCommand] of
          Object.entries<SubCommandOptions>(subCommand as Record<string, SubCommandOptions>)) {
          if (subSubCommand === true) {
            continue
          }

          const subSubCommandArgs = (this.args[subCommandName][subSubCommandName] = {}) as Record<string, Argument<any>>
          for (const argumentOptions of subSubCommand.args) {
            subSubCommandArgs[argumentOptions.name ?? argumentOptions.key] = this.argumentFactory(argumentOptions)
          }
        }
      }
    }
  }

  public execute (
    interaction: CommandInteraction,
    subCommandName: string,
    args: Record<string, any>
  ): Promise<void>
  public execute (
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
      return await Promise.resolve(fn.call(this, interaction, argsOrSubCommandName, args))
    } else {
      throw new Error(`Subcommand "${subCommandNameOrSubCommandGroupName.toString()}" does not exist.`)
    }
  }
}

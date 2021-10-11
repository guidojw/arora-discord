import type { AroraClient } from '../client'
import type { BaseArgumentType } from '../types'
import type { CommandInteraction } from 'discord.js'

export type ValidatorFunction<T> =
(val: string, interaction: CommandInteraction, arg: Argument<T>) => boolean | string | Promise<boolean | string>
export type ParserFunction<T> =
(val: string, interaction: CommandInteraction, arg: Argument<T>) => T | null | Promise<T | null>

export interface ArgumentOptions<T> {
  key: string
  name?: string
  type?: string
  required?: boolean
  default?: string | ((interaction: CommandInteraction) => T)
  validate?: ValidatorFunction<T>
  parse?: ParserFunction<T>
}

interface ArgumentResolvedOptions<T> extends Omit<ArgumentOptions<T>, 'type'> {
  type?: BaseArgumentType<any>
}

export default class Argument<T> {
  public readonly client: AroraClient
  public readonly key: string
  public readonly name?: string
  public readonly type?: BaseArgumentType<T>
  public readonly required?: boolean
  public readonly default?: string | ((interaction: CommandInteraction) => T)
  public readonly validator?: ValidatorFunction<T>
  public readonly parser?: ParserFunction<T>

  public constructor (client: AroraClient, options: ArgumentOptions<T>) {
    this.validateOptions(options)
    this.client = client

    const resolvedOptions = this.resolveOptions(options)
    this.key = resolvedOptions.key
    this.name = resolvedOptions.name
    this.type = resolvedOptions.type
    this.required = resolvedOptions.required
    this.default = resolvedOptions.default
    this.validator = resolvedOptions.validate
    this.parser = resolvedOptions.parse
  }

  public get validate (): ValidatorFunction<T> | null {
    return this.validator ?? this.type?.validate ?? null
  }

  public get parse (): ParserFunction<T> | null {
    return this.parser ?? this.type?.parse ?? null
  }

  private resolveOptions (options: ArgumentOptions<T>): ArgumentResolvedOptions<T> {
    return {
      ...options,
      type: typeof options.type !== 'undefined' ? this.client.argumentTypeFactory(options.type) : options.type
    }
  }

  private validateOptions (options: ArgumentOptions<T>): void {
    if (typeof options.type !== 'undefined' &&
      typeof this.client.argumentTypeFactory(options.type) === 'undefined') {
      throw new Error(`Argument type "${options.type}" not found.`)
    }
  }
}

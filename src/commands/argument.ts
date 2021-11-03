import type { AroraClient } from '../client'
import type { BaseArgumentType } from '../types'
import type { CommandInteraction } from 'discord.js'

export type ValidatorFunction<T> =
(value: string, interaction: CommandInteraction, arg: Argument<T>) => boolean | string | Promise<boolean | string>
export type ParserFunction<T> =
(value: string, interaction: CommandInteraction, arg: Argument<T>) => T | null | Promise<T | null>

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
  type?: BaseArgumentType<any> | Array<BaseArgumentType<any>>
}

export default class Argument<T> {
  public readonly client: AroraClient
  public readonly key: string
  public readonly name?: string
  public readonly type?: BaseArgumentType<T> | Array<BaseArgumentType<T>>
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
    if (typeof this.validator !== 'undefined') {
      return this.validator
    }
    return !Array.isArray(this.type)
      ? this.type?.validate ?? null
      : async function (
        this: Argument<T> & { type: Array<BaseArgumentType<T>> },
        value: string,
        interaction: CommandInteraction,
        arg: Argument<T>
      ) {
        const results = await Promise.all(this.type.map(type => type.validate(value, interaction, arg)))
        if (results.some(result => result === true)) {
          return true
        }
        const errors = results.filter(result => typeof result === 'string')
        if (errors.length > 0) {
          return errors.join('\n')
        }
        return false
      }
  }

  public get parse (): ParserFunction<T> | null {
    if (typeof this.parser !== 'undefined') {
      return this.parser
    }
    return !Array.isArray(this.type)
      ? this.type?.parse ?? null
      : async function (
        this: Argument<T> & { type: Array<BaseArgumentType<T>> },
        value: string,
        interaction: CommandInteraction,
        arg: Argument<T>
      ) {
        const results = await Promise.all(this.type.map(type => type.validate(value, interaction, arg)))
        for (let i = 0; i < results.length; i++) {
          if (typeof results[i] !== 'string') {
            return await this.type[i].parse(value, interaction, arg)
          }
        }
        return null
      }
  }

  private resolveOptions (options: ArgumentOptions<T>): ArgumentResolvedOptions<T> {
    let resolvedType
    if (typeof options.type !== 'undefined') {
      if (!Array.isArray(options.type)) {
        resolvedType = this.client.argumentTypeFactory(options.type)
      } else {
        resolvedType = []
        for (const typeName of options.type) {
          const type = this.client.argumentTypeFactory(typeName)
          if (typeof type !== 'undefined') {
            resolvedType.push(type)
          }
        }
      }
    }
    return {
      ...options,
      type: resolvedType
    }
  }

  private validateOptions (options: ArgumentOptions<T>): void {
    if (typeof options.type !== 'undefined') {
      if (!options.type.includes('|')) {
        if (typeof this.client.argumentTypeFactory(options.type) === 'undefined') {
          throw new Error(`Argument type "${options.type}" not found.`)
        }
      } else {
        const typeNames = options.type.split('|')
        for (const typeName of typeNames) {
          if (typeof this.client.argumentTypeFactory(typeName) === 'undefined') {
            throw new Error(`Argument type "${typeName}" not found.`)
          }
        }
      }
    }
  }
}

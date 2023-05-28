import { inject, injectable, type interfaces } from 'inversify'
import type { BaseArgumentType } from '../../../argument-types'
import type { ChatInputCommandInteraction } from 'discord.js'
import type { GuildContextManager } from '../../../managers'
import { constants } from '../../../utils'

const { TYPES } = constants

export type DefaultFunction<T> = ((interaction: ChatInputCommandInteraction, guildContexts: GuildContextManager) => T)
export type ValidatorFunction<T> =
(value: string, interaction: ChatInputCommandInteraction, arg: Argument<T>) =>
boolean | string | Promise<boolean | string>
export type ParserFunction<T> =
(value: string, interaction: ChatInputCommandInteraction, arg: Argument<T>) => T | null | Promise<T | null>

export interface ArgumentOptions<T> {
  key: string
  name?: string
  type?: string
  required?: boolean
  default?: string | DefaultFunction<T>
  validate?: ValidatorFunction<T>
  parse?: ParserFunction<T>
}

interface ArgumentResolvedOptions<T> extends Omit<ArgumentOptions<T>, 'type'> {
  type?: BaseArgumentType<any> | Array<BaseArgumentType<any>>
}

@injectable()
export default class Argument<T> {
  @inject(TYPES.ArgumentTypeFactory)
  private readonly argumentTypeFactory!: interfaces.AutoNamedFactory<BaseArgumentType<any> | undefined>

  public key!: string
  public name?: string
  public type?: BaseArgumentType<T> | Array<BaseArgumentType<T>>
  public required?: boolean
  public default?: string | DefaultFunction<T>
  public validator?: ValidatorFunction<T>
  public parser?: ParserFunction<T>

  public setOptions (options: ArgumentOptions<T>): void {
    this.validateOptions(options)

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
    return this.validator ?? (!Array.isArray(this.type)
      ? this.type?.validate.bind(this.type) ?? null
      : async function (
        this: Argument<T> & { type: Array<BaseArgumentType<T>> },
        value: string,
        interaction: ChatInputCommandInteraction,
        arg: Argument<T>
      ) {
        const results = await Promise.all(this.type.map(async type => await type.validate(value, interaction, arg)))
        if (results.some(result => result === true)) {
          return true
        }
        const errors = results.filter(result => typeof result === 'string')
        if (errors.length > 0) {
          return errors.join('\n')
        }
        return false
      }
    )
  }

  public get parse (): ParserFunction<T> | null {
    return this.parser ?? (!Array.isArray(this.type)
      ? this.type?.parse.bind(this.type) ?? null
      : async function (
        this: Argument<T> & { type: Array<BaseArgumentType<T>> },
        value: string,
        interaction: ChatInputCommandInteraction,
        arg: Argument<T>
      ) {
        const results = await Promise.all(this.type.map(async type => await type.validate(value, interaction, arg)))
        for (let i = 0; i < results.length; i++) {
          if (results[i] === true) {
            return await this.type[i].parse(value, interaction, arg)
          }
        }
        return null
      }
    )
  }

  private resolveOptions (options: ArgumentOptions<T>): ArgumentResolvedOptions<T> {
    let resolvedType
    if (typeof options.type !== 'undefined') {
      if (!options.type.includes('|')) {
        resolvedType = this.argumentTypeFactory(options.type)
      } else {
        resolvedType = []
        const typeNames = options.type.split('|')
        for (const typeName of typeNames) {
          const type = this.argumentTypeFactory(typeName)
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
        if (typeof this.argumentTypeFactory(options.type) === 'undefined') {
          throw new Error(`Argument type "${options.type}" not found.`)
        }
      } else {
        const typeNames = options.type.split('|')
        for (const typeName of typeNames) {
          if (typeof this.argumentTypeFactory(typeName) === 'undefined') {
            throw new Error(`Argument type "${typeName}" not found.`)
          }
        }
      }
    }
  }
}

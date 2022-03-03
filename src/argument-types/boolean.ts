import BaseArgumentType from './base'
import { injectable } from 'inversify'

@injectable()
export default class BooleanArgumentType extends BaseArgumentType<boolean> {
  private readonly truthy = ['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+']
  private readonly falsy = ['false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-']

  public validate (value: string): boolean {
    const lowerCaseValue = value.toLowerCase()
    return this.truthy.includes(lowerCaseValue) || this.falsy.includes(lowerCaseValue)
  }

  public parse (value: string): boolean {
    const lowerCaseValue = value.toLowerCase()
    return this.truthy.includes(lowerCaseValue)
  }
}

import BaseArgumentType from './base'
import { injectable } from 'inversify'

@injectable()
export default class IntegerArgumentType extends BaseArgumentType<number> {
  public validate (value: string): boolean {
    return /^[0-9]+$/.test(value)
  }

  public parse (value: string): number {
    return parseInt(value)
  }
}

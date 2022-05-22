import BaseArgumentType from './base'
import { argumentUtil } from '../utils'
import { injectable } from 'inversify'

const { validDate } = argumentUtil

@injectable()
export default class DateArgumentType extends BaseArgumentType<string> {
  public validate (value: string): boolean {
    return validDate(value)
  }

  public parse (value: string): string | null {
    if (!this.validate(value)) {
      return null
    }
    return value
  }
}

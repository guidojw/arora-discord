import BaseArgumentType from './base'
import { argumentUtil } from '../utils'
import { injectable } from 'inversify'

const { validTime } = argumentUtil

@injectable()
export default class extends BaseArgumentType<string> {
  public validate (value: string): boolean {
    return validTime(value)
  }

  public parse (value: string): string {
    return value
  }
}

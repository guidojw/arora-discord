import BaseArgumentType from './base'
import { injectable } from 'inversify'

@injectable()
export default class extends BaseArgumentType<object> {
  public validate (value: string): boolean {
    try {
      JSON.parse(value)
    } catch {
      return false
    }
    return true
  }

  public parse (value: string): object {
    return JSON.parse(value)
  }
}

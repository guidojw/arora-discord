import BaseArgumentType from './base'
import { injectable } from 'inversify'

@injectable()
export default class JsonObjectArgumentType extends BaseArgumentType<object> {
  public validate (value: string): boolean {
    try {
      JSON.parse(value)
    } catch {
      return false
    }
    return true
  }

  public parse (value: string): object | null {
    if (!this.validate(value)) {
      return null
    }
    return JSON.parse(value)
  }
}

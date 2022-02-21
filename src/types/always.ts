import BaseArgumentType from './base'
import { injectable } from 'inversify'

@injectable()
export default class extends BaseArgumentType<string> {
  public validate (): boolean {
    return true
  }

  public parse (value: string): string {
    return value
  }
}

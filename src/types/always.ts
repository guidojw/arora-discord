import BaseArgumentType from './base'
import { injectable } from 'inversify'

@injectable()
export default class AlwaysArgumentType extends BaseArgumentType<string> {
  public validate (): boolean {
    return true
  }

  public parse (value: string): string {
    return value
  }
}

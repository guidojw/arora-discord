import BaseArgumentType from './base'
import emojiRegex from 'emoji-regex'
import { injectable } from 'inversify'

@injectable()
export default class extends BaseArgumentType<string> {
  public validate (value: string): boolean {
    return new RegExp(`^(?:${emojiRegex().source})$`).test(value)
  }

  public parse (value: string): string | null {
    return value
  }
}

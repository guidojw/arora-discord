import BaseArgumentType from './base'
import emojiRegex from 'emoji-regex'
import { injectable } from 'inversify'

@injectable()
export default class DefaultEmojiArgumentType extends BaseArgumentType<string> {
  public validate (value: string): boolean {
    return new RegExp(`^(?:${emojiRegex().source})$`).test(value)
  }

  public parse (value: string): string | null {
    if (!this.validate(value)) {
      return null
    }
    return value
  }
}

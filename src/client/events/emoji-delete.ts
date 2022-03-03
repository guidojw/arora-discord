import { inject, injectable } from 'inversify'
import type { BaseHandler } from '..'
import type { Emoji } from '../../entities'
import type { GuildEmoji } from 'discord.js'
import { Repository } from 'typeorm'
import { constants } from '../../utils'

const { TYPES } = constants

@injectable()
export default class EmojiDeleteEventHandler implements BaseHandler {
  @inject(TYPES.EmojiRepository)
  private readonly emojiRepository!: Repository<Emoji>

  public async handle (emoji: GuildEmoji): Promise<void> {
    await this.emojiRepository.delete(emoji.id)
  }
}

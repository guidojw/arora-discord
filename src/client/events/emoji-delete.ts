import { inject, injectable } from 'inversify'
import type BaseHandler from '../base'
import type Client from '../client'
import type { Emoji } from '../../entities'
import type { GuildEmoji } from 'discord.js'
import { Repository } from 'typeorm'
import { constants } from '../../utils'

const { TYPES } = constants

@injectable()
export default class EmojiDeleteEventHandler implements BaseHandler {
  @inject(TYPES.EmojiRepository)
  private readonly emojiRepository!: Repository<Emoji>

  public async handle (_client: Client, emoji: GuildEmoji): Promise<void> {
    await this.emojiRepository.delete(emoji.id)
  }
}

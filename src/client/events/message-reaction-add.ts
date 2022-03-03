import type { MessageReaction, User } from 'discord.js'
import { inject, injectable, named } from 'inversify'
import type BaseHandler from '../base'
import type { GuildContext } from '../../structures'
import type { GuildContextManager } from '../../managers'
import { constants } from '../../utils'

const { TYPES } = constants

@injectable()
export default class MessageReactionAddEventHandler implements BaseHandler {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async handle (reaction: MessageReaction, user: User): Promise<void> {
    if (user.bot) {
      return
    }
    if (reaction.message.partial) {
      await reaction.message.fetch()
    }
    if (reaction.message.guild === null) {
      return
    }
    const context = this.guildContexts.resolve(reaction.message.guild) as GuildContext

    await Promise.all([
      context.handleRoleMessage('add', reaction, user),
      context.tickets.onMessageReactionAdd(reaction, user)
    ])
  }
}

import type { MessageReaction, User } from 'discord.js'
import { inject, injectable, named } from 'inversify'
import type { BaseHandler } from '..'
import type { GuildContext } from '../../structures'
import type { GuildContextManager } from '../../managers'
import { constants } from '../../utils'

const { TYPES } = constants

@injectable()
export default class MessageReactionRemoveEventHandler implements BaseHandler {
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

    await context.handleRoleMessage('remove', reaction, user)
  }
}

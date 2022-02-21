import type { MessageReaction, User } from 'discord.js'
import type BaseHandler from '../base'
import type Client from '../client'
import type { GuildContext } from '../../structures'
import { injectable } from 'inversify'

@injectable()
export default class MessageReactionAddEventHandler implements BaseHandler {
  public async handle (client: Client, reaction: MessageReaction, user: User): Promise<void> {
    if (user.bot) {
      return
    }
    if (reaction.message.partial) {
      await reaction.message.fetch()
    }
    if (reaction.message.guild === null) {
      return
    }
    const context = client.guildContexts.resolve(reaction.message.guild) as GuildContext

    await Promise.all([
      context.handleRoleMessage('add', reaction, user),
      context.tickets.onMessageReactionAdd(reaction, user)
    ])
  }
}

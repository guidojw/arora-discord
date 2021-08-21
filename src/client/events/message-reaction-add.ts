import type { MessageReaction, User } from 'discord.js'
import type BaseHandler from '../base'
import type Client from '../client'
import { injectable } from 'inversify'

@injectable()
export default class MessageReactionAddEventHandler implements BaseHandler {
  public async handle (_client: Client, reaction: MessageReaction, user: User): Promise<void> {
    if (user.bot) {
      return
    }
    if (reaction.message.partial) {
      await reaction.message.fetch()
    }
    if (reaction.message.guild === null) {
      return
    }

    await Promise.all([
      reaction.message.guild.handleRoleMessage('add', reaction, user),
      reaction.message.guild.tickets.onMessageReactionAdd(reaction, user)
    ])
  }
}
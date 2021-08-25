import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { GuildEmoji, Message } from 'discord.js'
import BaseCommand from '../base'
import type { TicketType } from '../../structures'

export default class LinkTicketTypeCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'linktickettype',
      aliases: ['linktt'],
      description: 'Links a message reaction to a ticket type.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'type',
        prompt: 'What ticket type would you like to link?',
        type: 'ticket-type'
      }, {
        key: 'emoji',
        prompt: 'What emoji would you like to link to this ticket type?',
        type: 'custom-emoji|default-emoji'
      }, {
        key: 'message',
        prompt: 'On what message would you like this emoji to be reacted?',
        type: 'message'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { type, message: bindMessage, emoji }: {
      type: TicketType
      message: Message
      emoji: GuildEmoji | string
    }
  ): Promise<Message | Message[] | null> {
    type = await message.guild.ticketTypes.link(type, bindMessage, emoji)

    return await message.reply(`Successfully linked emoji ${type.emoji?.toString() ?? 'Unknown'} on message \`${type.messageId ?? 'unknown'}\` to ticket type \`${type.name}\`.`)
  }
}

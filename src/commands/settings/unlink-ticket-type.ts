import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import type { TicketType } from '../../structures'

export default class UnlinkTicketTypeCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'unlinktickettype',
      aliases: ['unlinktt'],
      description: 'Unlinks a ticket type from a message reaction.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'type',
        prompt: 'What ticket type would you like to unlink?',
        type: 'ticket-type'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { type }: { type: TicketType }
  ): Promise<Message | Message[] | null> {
    type = await message.guild.ticketTypes.unlink(type)

    return await message.reply(`Successfully unlinked message reaction from ticket type \`${type.name}\`.`)
  }
}

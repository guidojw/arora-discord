import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import type { TicketType } from '../../structures'

export default class DeleteTicketTypeCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'deletetickettype',
      aliases: ['deltickettype', 'deletett', 'deltt'],
      description: 'Deletes a ticket type.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'type',
        prompt: 'What ticket type would you like to delete?',
        type: 'ticket-type'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { type }: { type: TicketType }
  ): Promise<Message | Message[] | null> {
    await message.guild.ticketTypes.delete(type)

    return await message.reply('Successfully deleted ticket type.')
  }
}

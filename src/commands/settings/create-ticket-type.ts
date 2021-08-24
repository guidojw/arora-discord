import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'

export default class CreateTicketTypeCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'createtickettype',
      aliases: ['creatett'],
      description: 'Creates a new ticket type.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        prompt: 'What do you want the name of the ticket type to be?',
        type: 'string',
        max: 16
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { name }: { name: string }
  ): Promise<Message | Message[] | null> {
    const type = await message.guild.ticketTypes.create(name)

    return await message.reply(`Successfully created ticket type \`${type.name}\`.`)
  }
}

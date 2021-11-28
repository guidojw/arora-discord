import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import type { TicketType } from '../../structures'
import applicationConfig from '../../configs/application'
import { discordService } from '../../services'

export default class RoleBindingsCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'tickettypes',
      description: 'Lists all ticket types.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'type',
        prompt: 'What ticket type would you like to know the information of?',
        type: 'ticket-type',
        default: ''
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { type }: { type: TicketType | '' }
  ): Promise<Message | Message[] | null> {
    if (type !== '') {
      const embed = new MessageEmbed()
        .addField(`Ticket Type ${type.id}`, `Name: \`${type.name}\``)
        .setColor(message.guild.primaryColor ?? applicationConfig.defaultColor)
      return await message.replyEmbed(embed)
    } else {
      if (message.guild.ticketTypes.cache.size === 0) {
        return await message.reply('No ticket types found.')
      }

      const embeds = discordService.getListEmbeds(
        'Ticket Types',
        message.guild.ticketTypes.cache.values(),
        getTicketTypeRow
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
      return null
    }
  }
}

function getTicketTypeRow (type: TicketType): string {
  return `${type.id}. \`${type.name}\``
}

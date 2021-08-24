import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { GuildMember, Message, TextChannel } from 'discord.js'
import BaseCommand from '../base'
import { discordService } from '../../services'
import { stripIndents } from 'common-tags'

export default class CloseTicketCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'closeticket',
      aliases: ['close'],
      description: 'Closes this ticket.',
      clientPermissions: ['ADD_REACTIONS', 'SEND_MESSAGES', 'MANAGE_CHANNELS'],
      guarded: true,
      hidden: true
    })
  }

  public async run (
    message: CommandoMessage & { member: GuildMember, channel: TextChannel }
  ): Promise<Message | Message[] | null> {
    const ticket = message.guild.tickets.resolve(message.channel)
    if (ticket !== null) {
      const prompt = await message.channel.send('Are you sure you want to close this ticket?')
      const choice = (await discordService.prompt(message.author, prompt, ['✅', '🚫']))?.toString() === '✅'

      if (choice) {
        await message.guild.log(
          message.author,
          stripIndents`
          ${message.author} **closed ticket** \`${ticket.id}\`
          ${message.content}
          `,
          { footer: `Ticket ID: ${ticket.id}` }
        )

        if (message.member.id === ticket.author?.id) {
          await ticket.close(
            'Ticket successfully closed.',
            false,
            message.guild.primaryColor ?? 0xffffff)
        } else {
          await ticket.close(
            'The moderator has closed your ticket.',
            true,
            message.guild.primaryColor ?? 0xffffff)
        }
      }
    } else if (message.guild.ticketsCategory !== null && message.channel.parentID === message.guild.ticketsCategoryId &&
      message.channel.id !== message.guild.ratingsChannelId) {
      await message.channel.delete()
    }
    return null
  }
}

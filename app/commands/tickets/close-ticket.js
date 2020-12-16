'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

const { stripIndents } = require('common-tags')

module.exports = class CloseTicketCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'tickets',
      name: 'closeticket',
      aliases: ['close'],
      description: 'Closes this ticket.',
      clientPermissions: ['ADD_REACTIONS', 'SEND_MESSAGES', 'MANAGE_CHANNELS']
    })
  }

  async execute (message, _args, guild) {
    const ticketsController = this.client.bot.ticketsController
    const ticketController = ticketsController.getTicketFromChannel(guild, message.channel)
    if (ticketController) {
      const prompt = await message.channel.send('Are you sure you want to close this ticket?')
      const choice = await discordService.prompt(message.channel, message.author, prompt, ['✅', '🚫']) === '✅'

      if (choice) {
        guild.log(message.author, stripIndents`
        ${message.author} **closed ticket** \`${ticketController.id}\`
        ${message.content}
        `, `Ticket ID: ${ticketController.id}`)

        if (message.author.id === ticketController.author.id) {
          ticketController.close('Ticket successfully closed.', false, guild.primaryColor)
        } else {
          ticketController.close('The moderator has closed your ticket.', true, guild.primaryColor)
        }
      }
    }
  }
}

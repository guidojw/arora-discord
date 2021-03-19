'use strict'
const BaseCommand = require('../base')

class UnbindTicketTypeCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'unbindtickettype',
      aliases: ['unbndtickettype', 'unbindtt', 'unbndtt'],
      description: 'Uninds a ticket type from a message.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'type',
        prompt: 'What ticket type would you like to bind?',
        type: 'integer|string'
      }]
    })
  }

  async run (message, { type }) {
    type = await message.guild.ticketTypes.unbind(type)

    return message.reply(`Successfully unbound ticket type **${type.name}** from message.`)
  }
}

module.exports = UnbindTicketTypeCommand

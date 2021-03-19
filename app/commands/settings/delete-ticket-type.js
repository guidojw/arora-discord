'use strict'
const BaseCommand = require('../base')

class DeleteTicketTypeCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'deletetickettype',
      aliases: ['deltickettype', 'deletett', 'deltt'],
      description: 'Deletes a ticket type.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'type',
        prompt: 'What ticket type would you like to delete?',
        type: 'integer|string'
      }]
    })
  }

  async run (message, { type }) {
    await message.guild.ticketTypes.delete(type)

    return message.reply('Successfully deleted ticket type.')
  }
}

module.exports = DeleteTicketTypeCommand

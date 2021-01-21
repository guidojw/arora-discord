'use strict'
const BaseCommand = require('../base')

const { TicketType } = require('../../models')

class DeleteTicketTypeCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'deletetickettype',
      aliases: ['deltickettype'],
      description: 'Deletes a ticket type.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'typeId',
        prompt: 'What ticket type would you like to delete?',
        type: 'integer'
      }]
    })
  }

  async run (message, { typeId }) {
    const ticketType = await TicketType.findByPk(typeId)
    if (!ticketType) {
      return message.reply('Ticket type not found.')
    }

    await ticketType.destroy()

    return message.reply('Successfully deleted ticket type.')
  }
}

module.exports = DeleteTicketTypeCommand

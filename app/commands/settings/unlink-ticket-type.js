'use strict'
const BaseCommand = require('../base')

class UnlinkTicketTypeCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'unlinktickettype',
      aliases: ['unlinktt'],
      description: 'Unlinks a message reaction from a ticket type.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'type',
        prompt: 'What ticket type would you like to unlink?',
        type: 'ticket-type'
      }]
    })
  }

  async run (message, { type }) {
    type = await message.guild.ticketTypes.unlink(type)

    return message.reply(`Successfully unlinked message reaction from ticket type \`${type.name}\`.`)
  }
}

module.exports = UnlinkTicketTypeCommand

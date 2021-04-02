'use strict'

const BaseCommand = require('../base')

class CreateTicketTypeCommand extends BaseCommand {
  constructor (client) {
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

  async run (message, { name }) {
    const type = await message.guild.ticketTypes.create(name)

    return message.reply(`Successfully created ticket type \`${type.name}\`.`)
  }
}

module.exports = CreateTicketTypeCommand

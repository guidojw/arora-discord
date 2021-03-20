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
        validate: validateName
      }]
    })
  }

  async run (message, { name }) {
    const type = await message.guild.ticketTypes.create(name)

    return message.reply(`Successfully created ticket type **${type.name}**.`)
  }
}

function validateName (val, msg) {
  const valid = this.type.validate(val, msg, this)
  if (!valid || typeof valid === 'string') {
    return valid
  }
  return val.length > 16
    ? 'Name is too long.'
    : true
}

module.exports = CreateTicketTypeCommand

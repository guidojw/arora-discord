'use strict'
const BaseCommand = require('../base')

const { TicketType } = require('../../models')

class AddTicketTypeCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'addtickettype',
      description: 'Adds a new ticket type.',
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
    name = name.toLowerCase()
    const [, created] = await TicketType.findOrCreate({
      where: {
        guildId: message.guild.id,
        name
      }
    })
    if (!created) {
      return message.reply('A ticket type with that name already exists.')
    }

    return message.reply(`Successfully added ticket type **${name}**.`)
  }
}

function validateName (name) {
  return name.includes(' ')
    ? 'Name cannot include spaces.'
    : name.length > 16
      ? 'Name is too long.'
      : true
}

module.exports = AddTicketTypeCommand

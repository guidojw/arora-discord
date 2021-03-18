'use strict'
const BaseCommand = require('../base')

class BindTicketTypeCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'bindtickettype',
      aliases: ['bindtickettype'],
      description: 'Binds a ticket type to a panel and connects a reaction.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'ticketType',
        prompt: 'What ticket type would you like to bind?',
        type: 'integer|string'
      }, {
        key: 'panel',
        prompt: 'To what panel would you like to bind this ticket type?. Reply with "none" if you want to unbind the ' +
          'ticket type.',
        type: 'integer|string',
        validate: validateNoneOrType,
        parse: parseNoneOrType
      }, {
        key: 'emoji',
        prompt: 'What emoji would you like to bind to this ticket type? Reply with "none" if you replied with none ' +
          'on the previous prompt as well.',
        type: 'custom-emoji|default-emoji',
        validate: validateNoneOrType,
        parse: parseNoneOrType
      }]
    })
  }

  async run (message, { ticketType, panel, emoji }) {
    ticketType = await message.guild.ticketTypes.bind(ticketType, panel, emoji)

    return message.reply(ticketType.panel
      ? `Successfully bound ticket type **${ticketType.name}** to emoji **${emoji}** on panel **${ticketType.panel.name}**.`
      : `Successfully unbound ticket type **${ticketType.name}** from panel.`
    )
  }
}

function validateNoneOrType (val, msg) {
  return val === 'none' || this.type.validate(val, msg, this)
}

function parseNoneOrType (val, msg) {
  return val === 'none' ? undefined : this.type.parse(val, msg, this)
}

module.exports = BindTicketTypeCommand

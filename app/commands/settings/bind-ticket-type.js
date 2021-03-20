'use strict'
const BaseCommand = require('../base')

class BindTicketTypeCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'bindtickettype',
      aliases: ['bndtickettype', 'bindtt', 'bndtt'],
      description: 'Binds a ticket type to a message and connects a reaction.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'type',
        prompt: 'What ticket type would you like to bind?',
        type: 'integer|string'
      }, {
        key: 'message',
        prompt: 'To what message would you like to bind this ticket type?',
        type: 'string',
        validate: validateMessage
      }, {
        key: 'channel',
        prompt: 'In what channel is this message?',
        type: 'text-channel'
      }, {
        key: 'emoji',
        prompt: 'What emoji would you like to bind to this ticket type?',
        type: 'custom-emoji|default-emoji'
      }]
    })
  }

  async run (message, { type, message: bindMessage, channel, emoji }) {
    type = await message.guild.ticketTypes.bind(type, channel, bindMessage, emoji)

    return message.reply(`Successfully bound ticket type **${type.name}** to emoji ${type.emoji} on message **${type.messageId}**.`)
  }
}

function validateMessage (val, msg) {
  const valid = this.type.validate(val, msg, this)
  if (!valid || typeof valid === 'string') {
    return valid
  }
  return /^[0-9]+$/.test(val) || 'Message must be a snowflake ID.'
}

module.exports = BindTicketTypeCommand

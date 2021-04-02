'use strict'

const BaseCommand = require('../base')

class LinkTicketTypeCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'linktickettype',
      aliases: ['linktt'],
      description: 'Links a message reaction to a ticket type.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'type',
        prompt: 'What ticket type would you like to link?',
        type: 'ticket-type'
      }, {
        key: 'emoji',
        prompt: 'What emoji would you like to link to this ticket type?',
        type: 'custom-emoji|default-emoji'
      }, {
        key: 'message',
        prompt: 'On what message would you like this emoji to be reacted?',
        type: 'message'
      }]
    })
  }

  async run (message, { type, emoji, message: bindMessage }) {
    type = await message.guild.ticketTypes.link(type, emoji, bindMessage)

    return message.reply(`Successfully linked emoji ${type.emoji} on message \`${type.messageId}\` to ticket type \`${type.name}\`.`)
  }
}

module.exports = LinkTicketTypeCommand

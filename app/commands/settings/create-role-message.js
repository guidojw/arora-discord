'use strict'
const BaseCommand = require('../base')

const { validators, isSnowflake } = require('../../util').argumentUtil

class CreateRoleMessageCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'createrolemessage',
      aliases: ['createrolemsg'],
      description: 'Creates a new role message.',
      clientPermissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
      args: [{
        key: 'role',
        prompt: 'For what role do you want to make a role message?',
        type: 'role'
      }, {
        key: 'message',
        prompt: 'What message would you like to make a role message?',
        type: 'string',
        validate: validators([isSnowflake])
      }, {
        key: 'channel',
        prompt: 'In what channel is this message?',
        type: 'text-channel'
      }, {
        key: 'emoji',
        prompt: 'What emoji do you want to bind to this message?',
        type: 'custom-emoji|default-emoji'
      }]
    })
  }

  async run (message, { role, message: newMessage, channel, emoji }) {
    const roleMessage = await message.guild.roleMessages.create({ role, message: newMessage, channel, emoji })

    return message.reply(`Successfully bound role ${roleMessage.role} to emoji ${roleMessage.emoji} on message \`${roleMessage.messageId}\`.`, {
      allowedMentions: { users: [message.author.id] }
    })
  }
}

module.exports = CreateRoleMessageCommand

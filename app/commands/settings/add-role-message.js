'use strict'
const Command = require('../../controllers/command')

const { RoleMessage } = require('../../models')

module.exports = class AddRoleMessageCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'addrolemessage',
      aliases: ['addrolemsg'],
      description: 'Adds a new role message.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'messageId',
        prompt: 'What message would you like to add role functionality to?',
        type: 'string',
        validate: messageId => {
          return /^[0-9]+$/.test(messageId)
        }
      }, {
        key: 'emoji',
        prompt: 'What emoji do you want to bind to this message?',
        type: 'string',
        validate: emoji => {
          if (emoji.charAt(0) === '<') {
            return emoji.indexOf(':') !== emoji.lastIndexOf(':') && emoji.charAt(0) === '<' && emoji.charAt(emoji
              .length - 1) === '>'
          }
          return true
        }
      }, {
        key: 'role',
        prompt: 'What role do you want to bind to this emoji?',
        type: 'role'
      }]
    })
  }

  async execute (message, { messageId, emoji, role }, guild) {
    if (emoji.charAt(0) === '<') {
      emoji = emoji.substring(emoji.lastIndexOf(':') + 1, emoji.indexOf('>'))
    }

    const roleMessage = await RoleMessage.findOne({
      where: {
        messageId: messageId,
        emojiId: emoji,
        roleId: role.id,
        guildId: guild.id
      }
    })
    if (roleMessage) {
      return message.reply('A role message with that message, emoji and role already exists.')
    }

    await RoleMessage.create({
      messageId: messageId,
      emojiId: emoji,
      roleId: role.id,
      guildId: guild.id
    })

    return message.reply('Successfully made role message.')
  }
}

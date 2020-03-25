'use strict'
const Command = require('../../controllers/command')

module.exports = class AddRoleMessageCommand extends Command {
    constructor(client) {
        super(client, {
            group: 'admin',
            name: 'addrolemessage',
            aliases: ['addrolemsg'],
            description: 'Adds a new role message.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
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
                            return emoji.indexOf(':') !== emoji.lastIndexOf(':') && emoji.charAt(0) === '<'
                                && emoji.charAt(emoji.length - 1) === '>'
                        }
                        return true
                    }
                }, {
                    key: 'role',
                    prompt: 'What role do you want to bind to this emoji?',
                    type: 'role'
                }
            ]
        })
    }

    execute (message, { messageId, emoji, role }, guild) {
        const roleMessages = guild.getData('roleMessages')
        if (!roleMessages[messageId]) roleMessages[messageId] = []
        if (emoji.charAt(0) === '<') {
            emoji = emoji.substring(emoji.lastIndexOf(':') + 1, emoji.indexOf('>'))
        }
        roleMessages[messageId].push({ role: role.id, emoji })
        guild.setData('roleMessages', roleMessages)
        return message.reply('Successfully made role message.')
    }
}

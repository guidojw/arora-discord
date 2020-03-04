'use strict'
const Command = require('../../controllers/command')

module.exports = class ShoutCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'shout',
            details: 'Shout can be either a message or "clear". When it\'s clear, the group shout will be cleared.',
            description: 'Posts shout with given shout to the group.',
            examples: ['shout Happywalker is awesome', 'shout clear'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'shout',
                    type: 'string',
                    prompt: 'What would you like to shout?'
                }
            ]
        })
    }

    execute (message, { shout }) {

    }
}

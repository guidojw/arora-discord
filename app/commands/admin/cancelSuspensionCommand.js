'use strict'
const Command = require('../../controllers/command')

module.exports = class CancelSuspensionCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'cancelsuspension',
            details: 'Username must be a username that is being used on Roblox.',
            description: 'Cancels given username\'s suspension.',
            examples: ['cancelsuspension Happywalker Good boy.'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Whose suspension would you like to cancel?'
                },
                {
                    key: 'reason',
                    type: 'string',
                    prompt: 'With what reason would you like to cancel this person\'s suspension?'
                }
            ]
        })
    }

    execute (message, { username, reason }) {

    }
}

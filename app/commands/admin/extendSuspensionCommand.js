'use strict'
const Command = require('../../controllers/command')

module.exports = class ExtendSuspensionCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'extendsuspension',
            details: 'Username must be a username that is being used on Roblox. A suspension can be max 7 days long.',
            aliases: ['extend'],
            description: 'Extends the suspension of given username.',
            examples: ['extend Happywalker 3 He still doesn\'t understand.'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Who would you like to suspend?'
                },
                {
                    key: 'days',
                    type: 'integer',
                    prompt: 'With how many days would you like to extend this person\'s suspension?'
                },
                {
                    key: 'reason',
                    type: 'string',
                    prompt: 'With what reason are you extending this person\'s suspension?'
                }
            ]
        })
    }

    execute (message, { username, days, reason }) {

    }
}

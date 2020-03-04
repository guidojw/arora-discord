'use strict'
const Command = require('../../controllers/command')

module.exports = class ChangeSuspensionCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'changesuspension',
            details: 'Username must be a username that is being used on Roblox. RankBack must be true or false. Key ' +
            'must be by, reason or rankBack. You can only the by key of suspensions you created.',
            description: 'Changes given username\'s suspension\'s key to given data.',
            examples: ['changesuspension Happywalker rankBack false'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Whose suspension would you like to change?'
                },
                {
                    key: 'key',
                    type: 'string',
                    prompt: 'What key would you like to change?',
                    oneOf: ['by', 'reason', 'rankBack']
                },
                {
                    key: 'data',
                    type: 'string',
                    prompt: 'What would you like to change this key\'s data to?'
                }
            ]
        })
    }

    execute (message, { username, key, data }) {

    }
}

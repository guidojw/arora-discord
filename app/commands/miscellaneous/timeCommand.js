'use strict'
const Command = require('../../controllers/command')

module.exports = class TimeCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'time',
            details: 'Timezone has to be an abbreviation of a existing timezone.',
            description: 'Posts the current time.',
            examples: ['time CET', 'time CEST'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'timezone',
                    type: 'string',
                    prompt: 'Of what timezone would you like to know the time?',
                    default: 'CET'
                }
            ]
        })
    }

    execute (message, { timezone }) {

    }
}

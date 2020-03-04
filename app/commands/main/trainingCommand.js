'use strict'
const Command = require('../../controllers/command')

module.exports = class TrainingCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'training',
            aliases: ['traininginfo'],
            details: 'TrainingId must be the ID of a currently scheduled training.',
            description: 'Posts the info of training with given trainingId.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'trainingId',
                    type: 'integer',
                    prompt: 'Of which training would you like to know the information?'
                }
            ]
        })
    }

    execute (message, { trainingId }) {

    }
}

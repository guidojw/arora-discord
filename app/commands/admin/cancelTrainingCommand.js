'use strict'
const Command = require('../../controllers/command')

module.exports = class CancelTrainingCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'canceltraining',
            details: 'TrainingId must be the ID of a currently scheduled training.',
            description: 'Cancels training with trainingId.',
            examples: ['canceltraining 1 Weird circumstances.'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'trainingId',
                    type: 'integer',
                    prompt: 'Which training would you like to cancel?'
                },
                {
                    key: 'reason',
                    type: 'string',
                    prompt: 'With what reason would you like to cancel this training?'
                }
            ]
        })
    }

    execute (message, { trainingId, reason }) {

    }
}

'use strict'
const Command = require('../../controllers/command')

module.exports = class FinishTrainingCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'finishtraining',
            details: 'TrainingId must be the ID of a currently scheduled training.',
            aliases: ['finish'],
            description: 'Finishes training with given trainingId.',
            examples: ['finish 25'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'trainingId',
                    type: 'integer',
                    prompt: 'Which training would you like to finish?'
                }
            ]
        })
    }

    execute (message, { trainingId }) {

    }
}

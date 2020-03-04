'use strict'
const Command = require('../../controllers/command')

module.exports = class ChangeTrainingCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'changetraining',
            details: 'TrainingId must be the ID of a currently scheduled training. Key must be type, date, time or ' +
            'specialNotes.',
            description: 'Changes training with trainingId\'s key to given data.',
            examples: ['changetraining 1 date 5-3-2020'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'trainingId',
                    type: 'integer',
                    prompt: 'Which training would you like to change?'
                },
                {
                    key: 'key',
                    type: 'string',
                    prompt: 'What key would you like to change?',
                    oneOf: ['type', 'date', 'time', 'specialNotes']
                },
                {
                    key: 'data',
                    type: 'string',
                    prompt: 'What would you like to change this key\'s data to?'
                }
            ]
        })
    }

    execute (message, { trainingId, key, data }) {

    }
}

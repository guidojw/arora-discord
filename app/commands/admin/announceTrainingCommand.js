'use strict'
const Command = require('../../controllers/command')

module.exports = class AnnounceTrainingCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'announcetraining',
            details: 'TrainingId must be the ID of a currently scheduled training. Medium must be both, roblox or ' +
            'discord.',
            aliases: ['announce'],
            description: 'Announces training with trainingId.',
            examples: ['announce 1', 'announce 1 discord'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'trainingId',
                    type: 'integer',
                    prompt: 'Which training would you like to announce?'
                },
                {
                    key: 'medium',
                    type: 'string',
                    prompt: 'Where would you like to announce this training?',
                    default: 'both',
                    oneOf: ['both', 'roblox', 'discord']
                }
            ]
        })
    }

    execute (message, { trainingId, medium }) {

    }
}

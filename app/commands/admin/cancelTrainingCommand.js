'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')

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

    async execute (message, { trainingId, reason }) {
        try {
            const training = (await applicationAdapter('put', `/v1/groups/${applicationConfig
                .groupId}/trainings/${trainingId}`, {
                cancelled: true,
                reason: reason,
                by: message.member.displayName
            })).data
            if (training) {
                message.reply(`Successfully cancelled Training ID **${trainingId}**.`)
            } else {
                message.reply(`Couldn't cancel Training ID **${trainingId}**.`)
            }
        } catch (err) {
            message.reply(err.message)
        }
    }
}

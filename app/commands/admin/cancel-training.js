'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const userService = require('../../services/user')

module.exports = class CancelTrainingCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'canceltraining',
            details: 'TrainingId must be the ID of a currently scheduled training.',
            description: 'Cancels training with trainingId.',
            examples: ['canceltraining 1 Weird circumstances.'],
            clientPermissions: ['SEND_MESSAGES'],
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
            await applicationAdapter('put', `/v1/groups/${applicationConfig.groupId}/trainings/${
                trainingId}`, {
                cancelled: true,
                reason,
                by: message.member.displayName,
                byUserId: await userService.getIdFromUsername(message.member.displayName)
            })
            message.reply(`Successfully cancelled training with ID **${trainingId}**.`)
        } catch (err) {
            message.reply(err.message)
        }
    }
}

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
            description: 'Cancels given training.',
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
        const authorId = await userService.getIdFromUsername(message.member.displayName)
        await applicationAdapter('post', `/v1/groups/${applicationConfig.groupId}/trainings/${
            trainingId}/cancel`, {
            authorId,
            reason
        })
        message.reply(`Successfully cancelled training with ID **${trainingId}**.`)
    }
}

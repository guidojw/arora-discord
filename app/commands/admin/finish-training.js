'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const userService = require('../../services/user')

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

    async execute (message, { trainingId }) {
        try {
            await applicationAdapter('put', `/v1/groups/${applicationConfig.groupId}/trainings/${
                trainingId}`, {
                finished: true,
                by: message.member.displayName,
                byUserId: await userService.getIdFromUsername(message.member.displayName)
            })
            message.reply(`Successfully finished training with ID **${trainingId}**.`)
        } catch (err) {
            message.reply(err.message)
        }
    }
}

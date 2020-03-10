'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const discordService = require('../../services/discord')

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

    async execute (message, { trainingId, medium }) {
        medium = medium.toLowerCase()
        try {
            const content = (await applicationAdapter('post', `/v1/groups/${applicationConfig
                .groupId}/trainings/${trainingId}/announce`, {
                medium: medium
            })).data
            if (medium === 'both' || medium === 'discord') {
                message.replyEmbed(discordService.getEmbed('Successfully announced', content.announcement))
            }
            if (medium === 'both' || medium === 'roblox') {
                message.replyEmbed(discordService.getEmbed('Successfully shouted', content.shout))
            }
        } catch (err) {
            message.reply(err.message)
        }
    }
}

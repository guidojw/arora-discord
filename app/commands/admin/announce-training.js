'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const { MessageEmbed } = require('discord.js')
const userService = require('../../services/user')

const applicationConfig = require('../../../config/application')

module.exports = class AnnounceTrainingCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'announcetraining',
            details: 'TrainingId must be the ID of a currently scheduled training.',
            aliases: ['announce'],
            description: 'Announces given training.',
            examples: ['announce 1'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'trainingId',
                    type: 'integer',
                    prompt: 'Which training would you like to announce?'
                }
            ]
        })
    }

    async execute (message, { trainingId }) {
        const authorId = await userService.getIdFromUsername(message.member.displayName)
        const announcement = (await applicationAdapter('post', `/v1/groups/${applicationConfig
            .groupId}/trainings/${trainingId}/announce`, { authorId })).data
        const embed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
            .addField('Successfully announced', announcement)
        message.replyEmbed(embed)
    }
}

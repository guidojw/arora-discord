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
            details: 'TrainingId must be the ID of a currently scheduled training. Medium must be both, roblox or ' +
            'discord.',
            aliases: ['announce'],
            description: 'Announces given training.',
            examples: ['announce 1', 'announce 1 discord'],
            clientPermissions: ['SEND_MESSAGES'],
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
        const authorId = await userService.getIdFromUsername(message.member.displayName)
        const content = (await applicationAdapter('post', `/v1/groups/${applicationConfig
            .groupId}/trainings/${trainingId}/announce`, { medium, authorId })).data
        const embed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
        if (medium === 'both' || medium === 'discord') {
            embed.addField('Successfully announced', content.announcement)
        }
        if (medium === 'both' || medium === 'roblox') {
            embed.addField('Successfully shouted', content.shout)
        }
        message.replyEmbed(embed)
    }
}

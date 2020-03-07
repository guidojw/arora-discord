'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const discordService = require('../../services/discord')
const groupService = require('../../services/group')

module.exports = class TrainingsCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'trainings',
            aliases: ['traininglist', 'training', 'traininginfo'],
            description: 'Lists info of all trainings/training with given ID.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            details: 'TrainingId must be the ID of a currently scheduled training.',
            args: [
                {
                    key: 'trainingId',
                    type: 'integer',
                    prompt: 'Of which training would you like to know the information?',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { trainingId }) {
        const trainings = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}` +
            '/trainings')).data
        if (trainings.length === 0) return message.reply('There are currently no hosted trainings.')
        if (trainingId) {
            for await (const training of trainings) {
                if (training.id === trainingId) {
                    return message.replyEmbed(discordService.getEmbed(`Training ID: ${training.id}`, groupService
                        .getTrainingSentence(training)))
                }
            }
            message.reply(`Couldn't find info for Training ID **${trainingId}**.`)
        } else {
            const trainingEmbeds = discordService.getTrainingEmbeds(trainings)
            const channel = await message.member.createDM()
            for (const embed of trainingEmbeds) {
                await channel.send(embed)
            }
        }
    }
}

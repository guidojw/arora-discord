'use strict'
const Command = require('../../controllers/command')
const { validTime, validDate } = require('../../helpers/time')
const groupService = require('../../services/group')
const timeHelper = require('../../helpers/time')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const discordService = require('../../services/discord')

module.exports = class HostTrainingCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'hosttraining',
            details: 'Type must be CD or CSR. You can add special notes that will be shown in the training\'s ' +
            'announcement. The date argument should be dd-mm-yyyy format.',
            aliases: ['host'],
            description: 'Schedules a new training.',
            examples: ['host CD 4-3-2020 1:00 Be on time!', 'Host CSR 4-3-2020 2:00'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'type',
                    type: 'string',
                    prompt: 'What kind of training is this?',
                    oneOf: ['CD', 'CSR']
                },
                {
                    key: 'date',
                    type: 'string',
                    prompt: 'At what date would you like to host this training?',
                    validate: validDate
                },
                {
                    key: 'time',
                    type: 'string',
                    prompt: 'At what time would you like to host this training?',
                    validate: validTime
                },
                {
                    key: 'specialNotes',
                    type: 'string',
                    prompt: 'Do you want to add any special notes?',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { type, date, time, specialNotes }) {
        const role = groupService.getRoleByAbbreviation(type)
        const dateInfo = timeHelper.getDateInfo(date)
        const timeInfo = timeHelper.getTimeInfo(time)
        const dateUnix = timeHelper.getUnix(new Date(dateInfo.year, dateInfo.month - 1, dateInfo.day, timeInfo
            .hours, timeInfo.minutes))
        const nowUnix = timeHelper.getUnix()
        const afterNow = dateUnix - nowUnix > 0
        if (!afterNow) return message.reply('Please give a date and time that\'s after now.')
        const username = message.member.nickname || message.author.username
        try {
            const trainingId = (await applicationAdapter('post', `/v1/groups/${applicationConfig
                .groupId}/trainings`, {
                by: username,
                type: type,
                date: dateUnix,
                specialnotes: specialNotes
            })).data
            message.replyEmbed(discordService.compileRichEmbed([{
                title: 'Successfully hosted',
                message: `**${role}** training on **${date}** at **${time}**.`,
            }, {
                title: 'Training ID:',
                message: trainingId.toString()
            }]))
        } catch (err) {
            message.reply(err.message)
        }
    }
}

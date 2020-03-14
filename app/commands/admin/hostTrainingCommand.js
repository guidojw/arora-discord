'use strict'
const Command = require('../../controllers/command')
const groupService = require('../../services/group')
const timeHelper = require('../../helpers/time')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const BotEmbed = require('../../views/botEmbed')

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
                    validate: timeHelper.validDate
                },
                {
                    key: 'time',
                    type: 'string',
                    prompt: 'At what time would you like to host this training?',
                    validate: timeHelper.validTime
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
        try {
            const trainingId = (await applicationAdapter('post', `/v1/groups/${applicationConfig
                .groupId}/trainings`, {
                by: message.member.displayName,
                type: type,
                date: dateUnix,
                specialnotes: specialNotes || undefined
            })).data
            const embed = new BotEmbed()
                .addField('Successfully hosted', `**${role}** training on **${date}** at **${time}**.`)
                .addField('Training ID:', trainingId.toString())
            message.replyEmbed(embed)
        } catch (err) {
            message.reply(err.message)
        }
    }
}

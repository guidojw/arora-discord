'use strict'
const Command = require('../../controllers/command')
const groupService = require('../../services/group')
const timeHelper = require('../../helpers/time')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const { MessageEmbed } = require('discord.js')

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
                    oneOf: ['cd', 'csr']
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
                    prompt: 'What notes would you like to add? Reply with "none" if you don\'t want to add any.',
                }
            ]
        })
    }

    async execute (message, { type, date, time, specialNotes }) {
        const role = groupService.getRoleByAbbreviation(type)
        const dateInfo = timeHelper.getDateInfo(date)
        const timeInfo = timeHelper.getTimeInfo(time)
        const dateUnix = Math.floor(new Date(dateInfo.year, dateInfo.month - 1, dateInfo.day, timeInfo.hours,
            timeInfo.minutes).getTime() / 1000)
        const afterNow = dateUnix - Math.floor(Date.now() / 1000) > 0
        if (!afterNow) return message.reply('Please give a date and time that are after now.')
        try {
            const trainingId = (await applicationAdapter('post', `/v1/groups/${applicationConfig
                .groupId}/trainings`, {
                by: message.member.displayName,
                type,
                date: dateUnix,
                specialnotes: specialNotes.toLowerCase() === 'none' ? undefined : specialNotes
            })).data
            const embed = new MessageEmbed()
                .addField('Successfully scheduled', `**${role}** training on **${date}** at **${time}**.`)
                .addField('Training ID', trainingId.toString())
            message.replyEmbed(embed)
        } catch (err) {
            message.reply(err.message)
        }
    }
}

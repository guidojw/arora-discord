'use strict'
const Command = require('../../controllers/command')
const groupService = require('../../services/group')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const timeHelper = require('../../helpers/time')
const userService = require('../../services/user')

module.exports = class ChangeTrainingCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'changetraining',
            details: 'TrainingId must be the ID of a currently scheduled training. Key must be type, date, time or ' +
            'specialNotes.',
            description: 'Changes training with trainingId\'s key to given data.',
            examples: ['changetraining 1 date 5-3-2020'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'trainingId',
                    type: 'integer',
                    prompt: 'Which training would you like to change?'
                },
                {
                    key: 'key',
                    type: 'string',
                    prompt: 'What key would you like to change?',
                    oneOf: ['type', 'date', 'time', 'specialNotes']
                },
                {
                    key: 'data',
                    type: 'string',
                    prompt: 'What would you like to change this key\'s data to?'
                }
            ]
        })
    }

    async execute (message, { trainingId, key, data }) {
        const newData = {}
        try {
            if (key === 'by') {
                newData.by = await userService.getIdFromUsername(data)
            } else if (key === 'specialNotes') {
                newData.specialnotes = data
            } else if (key === 'type') {
                const type = data.toUpperCase()
                if (!groupService.getRoleByAbbreviation(type)) return message.reply(`Role abbreviaton **${type}** does ` +
                    'not exist.')
                newData.type = type
            } else if (key === 'date' || key === 'time') {
                const training = await groupService.getTrainingById(trainingId)
                const unix = training.date * 1000
                let dateInfo
                let timeInfo
                if (key === 'date') {
                    if (!timeHelper.validDate(data)) return message.reply('Please enter a valid date.')
                    timeInfo = timeHelper.getTimeInfo(timeHelper.getTime(unix))
                    dateInfo = timeHelper.getDateInfo(data)
                } else {
                    if (!timeHelper.validTime(data)) return message.reply('Please enter a valid time.')
                    dateInfo = timeHelper.getDateInfo(timeHelper.getDate(unix))
                    timeInfo = timeHelper.getTimeInfo(data)
                }
                newData.date = timeHelper.getUnix(new Date(dateInfo.year, dateInfo.month - 1, dateInfo.day, timeInfo
                    .hours, timeInfo.minutes))
            }
            const training = (await applicationAdapter('put', `/v1/groups/${applicationConfig.groupId}` +
                `/trainings/${trainingId}`, newData)).data
            if (training) {
                message.reply(`Successfully changed training with ID **${trainingId}**.`)
            } else {
                message.reply(`Couldn't change training with ID **${trainingId}**.`)
            }
        } catch (err) {
            message.reply(err.message)
        }
    }
}

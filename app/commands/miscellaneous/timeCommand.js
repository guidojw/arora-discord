'use strict'
const Command = require('../../controllers/command')
const timeHelper = require('../../helpers/time')
const discordService = require('../../services/discord')

module.exports = class TimeCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'time',
            details: 'Timezone has to be an abbreviation of a existing timezone.',
            description: 'Posts the current time.',
            examples: ['time CET', 'time CEST'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'timezone',
                    type: 'string',
                    prompt: 'Of what timezone would you like to know the time?',
                    default: 'CET'
                }
            ]
        })
    }

    async execute (message, { timezone }) {
        const place = await timeHelper.getPlaceFromTimezone(timezone)
        if (!place) return message.reply(`Unknown timezone: ${timezone}`)
        const date = timeHelper.getTimeInTimezone(timezone)
        const hours = ('0' + date.getHours()).slice(-2)
        const minutes = ('0' + date.getMinutes()).slice(-2)
        const timeString = hours + ':' + minutes
        message.replyEmbed(discordService.getEmbed('time', timeString))
    }
}

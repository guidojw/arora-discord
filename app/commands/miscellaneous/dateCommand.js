'use strict'
const Command = require('../../controllers/command')
const timeHelper = require('../../helpers/time')
const discordService = require('../../services/discord')

module.exports = class DateCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'date',
            details: 'Timezone has to be an abbreviation of a existing timezone.',
            description: 'Posts the current date.',
            examples: ['date CET', 'date CEST'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'timezone',
                    type: 'string',
                    prompt: 'Of what timezone would you like to know the date?',
                    default: 'CET'
                }
            ]
        })
    }

    async execute (message, { timezone }) {
        const place = await timeHelper.getPlaceFromTimezone(timezone)
        if (!place) return message.reply(`Unknown timezone: ${timezone}`)
        const date = timeHelper.getTimeInTimezone(timezone)
        message.replyEmbed(discordService.getEmbed('date', date.toString()))
    }
}

'use strict'
const Command = require('../../controllers/command')
const urlHelper = require('../../helpers/url')

module.exports = class SetActivityCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'setactivity',
            details: 'Activity type must be playing, listening, watching or streaming. The activity argument must be ' +
                'encapsulated in quotes. When the activity type is streaming, you have to add a YouTube/Twitch url as' +
                ' last argument.',
            aliases: ['activity'],
            description: 'Sets the current activity of the bot.',
            examples: ['activity playing "Roblox"', 'activity streaming "Game Development" https://twitch.tv/guidojw'],
            clientPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'type',
                    prompt: 'What type of activity do you want the bot to do?',
                    type: 'string',
                    oneOf: ['playing', 'listening', 'watching', 'streaming']
                },
                {
                    key: 'activity',
                    prompt: 'What activity do you want the bot to do?',
                    type: 'string'
                },
                {
                    key: 'url',
                    prompt: 'What url would you like the bot to stream on?',
                    type: 'string',
                    default: '',
                    validate: urlHelper.validUrl
                }
            ]
        })
    }

    async execute (message, { type, activity, url }) {
        type = type.toUpperCase()
        if (type === 'STREAMING' && !url) {
            this.argsCollector.args[2].default = null
            const result = await this.argsCollector.obtain(message, [type, activity])
            this.argsCollector.args[2].default = ''
            if (!result.cancelled) {
                url = result.values.url
            } else if (result.cancelled === 'promptLimit') {
                return message.reply('Invalid url.')
            } else if (result.cancelled === 'user' || result.cancelled === 'time') {
                return message.reply('Cancelled command.')
            }
        }
        this.client.bot.setActivity(activity, { type: type, url: url || undefined })
    }
}

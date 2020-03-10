'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const discordService = require('../../services/discord')

module.exports = class GetShoutCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'getshout',
            description: 'Gets the current group shout.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    async execute (message) {
        const shout = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/` +
            'shout')).data
        if (shout.body) {
            message.replyEmbed(discordService.compileRichEmbed([{
                title: `Current shout by ${shout.poster.username}`,
                message: shout.body,
            }], {timestamp: shout.updated}))
        } else {
            message.reply('There currently is no shout.')
        }
    }
}

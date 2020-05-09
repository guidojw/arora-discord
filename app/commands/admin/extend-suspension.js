'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const userService = require('../../services/user')
const { getChannels, getTags, getUrls } = require('../../helpers/string')

const applicationConfig = require('../../../config/application')

module.exports = class ExtendSuspensionCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'extendsuspension',
            details: 'A suspension can be max 7 days long.',
            aliases: ['extend'],
            description: 'Extends the suspension of given user.',
            examples: ['extend Happywalker 3 He still doesn\'t understand.'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'member|string',
                    prompt: 'Whose suspension would you like to extend?'
                },
                {
                    key: 'days',
                    type: 'integer',
                    prompt: 'With how many days would you like to extend this person\'s suspension?',
                    validate: val => val < 1 ? 'Insufficient amount of days.' : val > 7 ? 'Too many days.' : true
                },
                {
                    key: 'reason',
                    type: 'string',
                    prompt: 'With what reason are you extending this person\'s suspension?',
                    validate: val => getChannels(val) ? 'Reason contains channels.' : getTags(val) ? 'Reason contains' +
                        ' tags.' : getUrls(val) ? 'Reason contains URLs.' : true
                }
            ]
        })
    }

    async execute (message, { username, days, reason }) {
        username = typeof username === 'string' ? username : username.displayName
        const [userId, authorId] = await Promise.all([userService.getIdFromUsername(username), userService
            .getIdFromUsername(message.member.displayName)])
        await applicationAdapter('post', `/v1/groups/${applicationConfig.groupId}/suspensions/${
            userId}/extend`, {
            duration: days * 86400000,
            authorId,
            reason
        })
        message.reply(`Successfully extended **${username}**'s suspension.`)
    }
}

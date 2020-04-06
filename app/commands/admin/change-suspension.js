'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')

module.exports = class ChangeSuspensionCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'changesuspension',
            details: 'Username must be a username that is being used on Roblox. RankBack must be true or false. Key ' +
            'must be by, reason or rankBack. You can only change the by key of suspensions you created.',
            description: 'Changes given username\'s suspension\'s key to given data.',
            examples: ['changesuspension Happywalker rankBack false'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Whose suspension would you like to change?'
                },
                {
                    key: 'key',
                    type: 'string',
                    prompt: 'What key would you like to change?',
                    oneOf: ['by', 'reason', 'rankback']
                },
                {
                    key: 'data',
                    type: 'string',
                    prompt: 'What would you like to change this key\'s data to?'
                }
            ]
        })
    }

    async execute (message, { username, key, data }) {
        key = key.toLowerCase()
        const changes = {}
        try {
            if (key === 'by') {
                changes.by = await userService.getIdFromUsername(data)
            } else if (key === 'reason') {
                changes.reason = data
            } else if (key === 'rankback') {
                if (data !== 'true' && data !== 'false') return message.reply(`**${data}** is not a valid value for ` +
                    'rankBack.')
                changes.rankback = data === 'true' ? 1 : 0
            }
            changes.byUserId = await userService.getIdFromUsername(message.member.displayName)
            const userId = await userService.getIdFromUsername(username)
            await applicationAdapter('put', `/v1/groups/${applicationConfig.groupId}/suspensions/${
                userId}`, changes)
            message.reply(`Successfully changed **${username}**'s suspension.`)
        } catch (err) {
            message.reply(err.message)
        }
    }
}

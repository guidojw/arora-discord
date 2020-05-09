'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')
const { getChannels, getTags, getUrls } = require('../../helpers/string')

const applicationConfig = require('../../../config/application')

module.exports = class ChangeSuspensionCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'changesuspension',
            details: 'Key must be author, reason or rankBack. RankBack must be true or false. You can only change the' +
                ' author of suspensions you created.',
            description: 'Changes given user\'s suspension\'s key to given data.',
            examples: ['changesuspension Happywalker rankBack false'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'member|string',
                    prompt: 'Whose suspension would you like to change?'
                },
                {
                    key: 'key',
                    type: 'string',
                    prompt: 'What key would you like to change?',
                    oneOf: ['author', 'reason', 'rankback']
                },
                {
                    key: 'data',
                    type: 'boolean|string',
                    prompt: 'What would you like to change this key\'s data to?'
                }
            ]
        })
    }

    async execute (message, { username, key, data }) {
        key = key.toLowerCase()
        const changes = {}
        if (key === 'author') {
            changes.authorId = await userService.getIdFromUsername(data)
        } else if (key === 'reason') {
            const error = getChannels(data) ? 'Reason contains channels.' : getTags(data) ? 'Reason contains tags.' :
                getUrls(data) ? 'Reason contains URLs.' : undefined
            if (error) return message.reply(error)
            changes.reason = data
        } else if (key === 'rankback') {
            if (data !== true && data !== false) {
                return message.reply(`**${data}** is not a valid value for rankBack.`)
            }
            changes.rankBack = data
        }
        username = typeof username === 'string' ? username : username.displayName
        const [userId, editorId] = await Promise.all([userService.getIdFromUsername(username), userService
            .getIdFromUsername(message.member.displayName)])
        await applicationAdapter('put', `/v1/groups/${applicationConfig.groupId}/suspensions/${
            userId}`, { changes, editorId })
        message.reply(`Successfully changed **${username}**'s suspension.`)
    }
}

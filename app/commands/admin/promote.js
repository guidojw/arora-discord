'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')

const applicationConfig = require('../../../config/application')

module.exports = class PromoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'promote',
            description: 'Promotes given user in the group.',
            examples: ['promote Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Who would you like to promote?',
                    type: 'member|string'
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username ? typeof username === 'string' ? username : username.displayName : message.member
            .displayName
        const [userId, authorId] = await Promise.all([userService.getIdFromUsername(username), userService
            .getIdFromUsername(message.member.displayName)])
        const rank = await userService.getRank(userId, applicationConfig.groupId)
        const roles = (await applicationAdapter('put', `/v1/groups/${applicationConfig.groupId}/` +
            `users/${userId}`, { authorId, rank: rank === 1 ? 3 : rank >= 3 && rank < 5 || rank >= 100 && rank <
            102 ? rank + 1 : rank === 5 ? 100 : undefined })).data
        message.reply(`Successfully promoted **${username}** from **${roles.oldRole.name}** to **${roles.newRole
            .name}**.`)
    }
}

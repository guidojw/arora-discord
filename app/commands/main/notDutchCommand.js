'use strict'
const Command = require('../../controllers/command')

module.exports = class NotDutchCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'notdutch',
            description: 'Gives you the Not Dutch role so that the #dutchland channel becomes hidden.',
            clientPermissions: ['MANAGE_MESSAGES', 'MANAGE_ROLES', 'SEND_MESSAGES']
        })
    }

    execute (message, _args, guild) {
        const notDutchRoleId = guild.getData('roles').notDutchRole
        if (!message.member.roles.cache.has(notDutchRoleId)) {
            message.member.roles.add(notDutchRoleId)
            message.reply('Successfully updated roles.')
        } else {
            message.reply('You already have the Not Dutch role.')
        }
    }
}

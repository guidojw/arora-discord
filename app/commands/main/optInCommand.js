'use strict'
const Command = require('../../controllers/command')

module.exports = class OptInCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'optin',
            description: 'Removes your No Training Announcements role so that the #trainings channel becomes visible.',
            clientPermissions: ['MANAGE_MESSAGES', 'MANAGE_ROLES', 'SEND_MESSAGES']
        })
    }

    execute (message, _args, guild) {
        if (message.member.roles.has('No Training Announcements')) {
            message.member.removeRole(guild.getData('roles').noTrainingAnnouncementsRole)
            message.reply('Successfully opted in.')
        } else {
            message.reply('You\'re already opted in.')
        }
    }
}

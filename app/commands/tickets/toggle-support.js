'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

module.exports = class ToggleSupportCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'tickets',
            name: 'togglesupport',
            aliases: ['toggle'],
            description: 'Enables/disables the tickets system.',
            clientPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'SEND_MESSAGES'],
            guildOnly: false,
            adminOnly: true
        })
    }

    async execute (message, _args, _guild) {

    }
}

'use strict'
const Command = require('../../controllers/command')

module.exports = class BlockSupportCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'tickets',
            name: 'blocksupport',
            aliases: ['block'],
            description: 'Blocks someone from making tickets in the ticket system.',
            clientPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'SEND_MESSAGES'],
            guildOnly: false,
            adminOnly: true
        })
    }

    async execute (message, _args, guild) {

    }
}

'use strict'
const Command = require('../../controllers/command')

module.exports = class UnblockSupportCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'tickets',
            name: 'unblocksupport',
            aliases: ['unblock'],
            description: 'Unblocks someone from making tickets in the ticket system.',
            examples: ['unblocksupport Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            adminOnly: true,
            args: [
                {
                    key: 'member',
                    type: 'member',
                    prompt: 'Who would you like to unblock?'
                }
            ]
        })
    }

    async execute (message, { member }, guild) {
        const username = member.displayName
        const role = guild.getData('roles').ticketsBannedRole

        if (!member.roles.cache.has(role)) {
            await message.reply('Member is already unblocked.')
        } else {
            await member.roles.remove(role)
            await message.reply(`Successfully unblocked **${username}**.`)
        }
    }
}

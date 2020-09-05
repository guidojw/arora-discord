'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

module.exports = class BlockSupportCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'tickets',
            name: 'blocksupport',
            aliases: ['block'],
            description: 'Blocks someone from making tickets in the ticket system.',
            examples: ['blocksupport Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            adminOnly: true,
            args: [
                {
                    key: 'member',
                    type: 'member',
                    prompt: 'Who would you like to block?'
                }
            ]
        })
    }

    execute (message, { member }, guild) {
        const username = member.displayName
        const roles = guild.getData('roles')

        if (member.roles.cache.has(roles.ticketsBannedRole)) {
            return message.reply('Member is already blocked.')
        } else if (discordService.isAdmin(member, guild.getData('adminRoles'))) {
            return message.reply('Can\'t block HRs.')
        } else if (member.roles.cache.has(roles.ticketModeratorRole)) {
            return message.reply('Can\'t block Ticket Moderators.')
        }

        member.roles.add(roles.ticketsBannedRole)
        return message.reply(`Successfully blocked **${username}**.`)
    }
}

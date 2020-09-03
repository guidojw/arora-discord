'use strict'
const Command = require('../../controllers/command')
const { MessageEmbed } = require('discord.js')

module.exports = class ToggleSupportCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'tickets',
            name: 'togglesupport',
            aliases: ['toggle'],
            description: 'Enables/disables the support system.',
            clientPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'SEND_MESSAGES'],
            guildOnly: false,
            adminOnly: true
        })
    }

    async execute (message, _args, _guild) {
        // Toggle the setting
        const settings = this.client.bot.mainGuild.getData('settings')
        settings.supportEnabled = !settings.supportEnabled
        this.client.bot.mainGuild.setData('settings', settings)

        // Send success message
        const embed = new MessageEmbed()
            .setColor(settings.supportEnabled ? 0x00ff00 : 0xff0000)
            .setTitle('Successfully toggled support')
            .setDescription(`Tickets System: **${settings.supportEnabled ? 'enabled' : 'disabled'}**`)
        message.replyEmbed(embed)
    }
}

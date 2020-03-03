'use strict'
const Commando = require('discord.js-commando')
const discordService = require('../services/discord')

module.exports = class Command extends Commando.Command {
    constructor(client, info) {
        info.memberName = info.name
        info.argsPromptLimit = info.argsPromptLimit || 1
        info.guildOnly = info.guildOnly !== undefined ? info.guildOnly : true
        super(client, info)
    }

    hasPermission (message) {
        if (this.group.name.toLowerCase() === 'admin') {
            const guild = this.client.bot.guilds[message.guild.id]
            return discordService.isAdmin(message.member, guild.getData('adminRoles'))
        }
        return true
    }

    // eslint-disable-next-line no-unused-vars
    async run (message, args, _fromPattern) {
        const guild = this.client.bot.guilds[message.guild.id]
        return this.execute(message, args, guild)
    }
}

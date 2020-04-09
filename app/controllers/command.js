'use strict'
const Commando = require('discord.js-commando')
const discordService = require('../services/discord')

module.exports = class Command extends Commando.Command {
    constructor(client, info) {
        info.memberName = info.name
        info.argsPromptLimit = info.argsPromptLimit || info.group === 'admin' ? 3 : 1
        info.guildOnly = info.guildOnly !== undefined ? info.guildOnly : true
        super(client, info)
    }

    hasPermission (message) {
        const group = this.group.name.toLowerCase()
        if (group === 'admin' || group === 'voting') {
            const guild = this.client.bot.getGuild(message.guild.id)
            return discordService.isAdmin(message.member, guild.getData('adminRoles'))
        }
        return true
    }

    async run (message, args) {
        const guild = this.client.bot.getGuild(message.guild.id)
        return this.execute(message, args, guild)
    }
}

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

    hasPermission (message, ownerOverride) {
        const group = this.group.name.toLowerCase()
        if (!this.ownerOnly && (group === 'admin' || group === 'voting')) {
            const guild = this.client.bot.getGuild(message.guild.id)
            return discordService.isAdmin(message.member, guild.getData('adminRoles'))
        }
        return super.hasPermission(message, ownerOverride)
    }

    async run (message, args) {
        const guild = this.client.bot.getGuild(message.guild.id)
        try {
            return await this.execute(message, args, guild)
        } catch (err) {
            return this.handleError(err, message)
        }
    }

    handleError(err, message) {
        if (err.response && err.response.data.errors && err.response.data.errors.length > 0) {
            return message.reply(err.response.data.errors[0].message)
        } else {
            return message.reply(err.message)
        }
    }
}

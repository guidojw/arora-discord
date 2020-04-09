'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

module.exports = class DeleteVoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'voting',
            name: 'deletevote',
            aliases: ['vdelete'],
            description: 'Deletes the currently created vote.',
            clientPermissions: ['SEND_MESSAGES']
        })
    }

    async execute (message, _args, guild) {
        const voteData = guild.getData('vote')
        if (!voteData) return message.reply('There is no created vote.')
        if (voteData.timer && voteData.timer.end > Date.now()) return message.reply('The vote hasn\'t ended yet.')
        const choice = await discordService.prompt(message.channel, message.author, await message.reply('Are you sure' +
            ' you would like to delete the created vote?\n**You won\'t be able to use the results and showvote ' +
            'commands anymore!**'))
        if (choice) {
            guild.setData('vote', undefined)
            message.reply('Deleted vote.')
        } else {
            message.reply('Didn\'t delete vote.')
        }
    }
}

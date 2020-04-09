'use strict'
const Command = require('../../controllers/command')
const { MessageEmbed } = require('discord.js')
const pluralize = require('pluralize')

module.exports = class VoteResultsCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'voting',
            name: 'voteresults',
            aliases: ['vresults', 'results'],
            description: 'Posts the results of the vote.',
            clientPermissions: ['SEND_MESSAGES']
        })
    }

    execute (message, _args, guild) {
        const voteData = guild.getData('vote')
        if (!voteData) return message.reply('There\'s no vote created yet, create one using the createvote command.')
        if (!voteData.timer) return message.reply('The vote hasn\'t started yet.')
        if (voteData.timer && voteData.timer.end > Date.now()) return message.reply('The vote hasn\'t ended' +
            ' yet.')

        const embed = new MessageEmbed()
            .setTitle(`${voteData.title} Results`)
        const scores = []
        for (const [id, option] of Object.entries(voteData.options)) {
            scores.push({ id: id, votes: option.votes.length })
        }
        scores.sort((a, b) => {
            return b.votes - a.votes
        })
        let rank = 0
        let lastScore = undefined
        for (const score of scores) {
            if (score.votes !== lastScore) rank++
            lastScore = score.votes
            const user = this.client.users.cache.get(score.id)
            embed.addField(`${rank}. ${user.tag}`, `${score.votes} ${pluralize('vote', score.votes)}`)
        }
        message.replyEmbed(embed)
    }
}

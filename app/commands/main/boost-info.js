'use strict'
const Command = require('../../controllers/command')
const { MessageEmbed } = require('discord.js')
const pluralize = require('pluralize')

module.exports = class BoostInfoCommand extends Command {
    constructor(client) {
        super(client, {
            group: 'main',
            name: 'boostinfo',
            description: 'Posts the boost information of given member.',
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'member',
                    prompt: 'Whose boost info do you want to know?',
                    type: 'member',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { member }, guild) {
        if (!member) member = message.member
        if (!member.premiumSince) return message.reply(`${message.argString ? 'Member is not' : 'You\'re not'} a ` +
            'booster.')
        const now = new Date()
        const premiumDate = member.premiumSince
        let months = now.getMonth() - premiumDate.getMonth() + (now.getFullYear() - premiumDate.getFullYear()) * 12
        let days = now.getDate() - premiumDate.getDate()
        if (days < 0) {
            const daysInMonth = new Date(premiumDate.getFullYear(), premiumDate.getMonth() + 1, 0)
                .getDate()
            days += daysInMonth
            months--
        }
        const emojis = guild.getData('emojis')
        const emoji = guild.guild.emojis.cache.find(emoji => emoji.id === emojis.boostEmoji)
        if (member.user.partial) await member.user.partial.fetch()
        const embed = new MessageEmbed()
            .setTitle(`${member.user.tag} ${emoji}`)
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(`Has been boosting this server for **${months}** ${pluralize('month', months)} and **${days
            }** ${pluralize('day', days)}!`)
            .setColor(0xff73fa)
        message.replyEmbed(embed)
    }
}


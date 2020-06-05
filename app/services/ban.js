'use strict'
const userService = require('./user')
const { MessageEmbed } = require('discord.js')
const groupService = require('./group')
const timeHelper = require('../helpers/time')

const applicationConfig = require('../../config/application')

exports.getBanEmbeds = async bans => {
    const userIds = bans.map(ban => ban.userId)
    const authorIds = bans.map(ban => ban.authorId)
    const users = await userService.getUsers(userIds)
    const authors = await userService.getUsers(authorIds)
    const embeds = []
    let fields = []
    let sum = 0
    const addField = message => {
        message = message.trim()
        fields.push({ name: '\u200b', value: message })
    }
    const addEmbed = () => {
        const embed = new MessageEmbed()
            .addFields(fields)
            .setColor(applicationConfig.primaryColor)
        embeds.push(embed)
        fields = []
        sum = 0
    }
    let message = ''
    for (const ban of bans) {
        const username = users.find(user => user.id === ban.userId).name
        const author = ban.authorId ? authors.find(user => user.id === ban.authorId) : undefined
        const role = ban.rank ? groupService.getAbbreviationByRank(ban.rank) : undefined
        const dateString = ban.date ? timeHelper.getDate(new Date(ban.date)) : undefined
        const line = `**${username}**${role ? ' (' + role + ')' : ''}${author ? ' by **' + author.name + '**' : ''}${
            dateString ? ' at **' + dateString + '**' : ''}${ban.reason ? ' with reason:\n*' + ban.reason + '*' : ''}`
        const addition = line.length + 16 // TODO: tweak additions
        if (sum + addition <= 6000) {
            if (message.length + line.length <= 1024) {
                sum += line.length
            } else {
                addField(message)
                message = ''
                sum += addition
            }
        } else {
            addField(message)
            message = ''
            addEmbed()
        }
        message += line + '\n'
    }
    const addition = message.length + 8
    if (sum + addition > 6000) {
        addEmbed()
    }
    addField(message)
    addEmbed()
    embeds[0].setTitle('Banlist')
    return embeds
}

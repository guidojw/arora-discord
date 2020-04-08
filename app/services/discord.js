'use strict'
const groupService = require('./group')
const timeHelper = require('../helpers/time')
const userService = require('./user')
const { MessageEmbed } = require('discord.js')
const pluralize = require('pluralize')

exports.getMemberByName = async (guild, name) => {
    const members = await guild.members.fetch()
    for (const member of members.values()) {
        if (member.displayName.toLowerCase() === name.toLowerCase()) return member
    }
}

exports.isAdmin = (member, adminRoles) => {
    for (const roleId of adminRoles) {
        if (member.roles.cache.has(roleId)) return true
    }
    return false
}

exports.getTrainingEmbeds = trainings => {
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
        embeds.push(embed)
        fields = []
        sum = 0
    }
    let message = ''
    for (const training of trainings) {
        const line = training.id + '. ' + groupService.getTrainingSentence(training)
        const addition = line.length + 8 // TODO: tweak additions
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
        message += (line + '\n')
    }
    const addition = message.length + 8
    if (sum + addition > 6000) {
        addEmbed()
    }
    addField(message)
    addEmbed()
    embeds[0].setTitle('Upcoming Trainings')
    return embeds
}

exports.getBanEmbeds = async bans => {
    const userIds = bans.map(ban => ban.userId)
    const byUserIds = bans.map(ban => ban.by)
    const users = await userService.getUsers(userIds)
    const byUsers = await userService.getUsers(byUserIds)
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
        embeds.push(embed)
        fields = []
        sum = 0
    }
    let message = ''
    for (const ban of bans) {
        const username = users.find(user => user.id === ban.userId).name
        const byUser = ban.by ? byUsers.find(user => user.id === ban.by) : undefined
        const role = ban.rank ? groupService.getAbbreviationByRank(ban.rank) : undefined
        const dateString = ban.at ? timeHelper.getDate(ban.at * 1000) : undefined
        const line = `**${username}**${role ? ' (' + role + ')' : ''}${byUser ? ' by **' + byUser.name + '**' : ''}${
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

exports.getSuspensionEmbeds = async suspensions => {
    const userIds = suspensions.map(suspension => suspension.userId)
    const byUserIds = suspensions.map(suspension => suspension.by)
    const users = await userService.getUsers(userIds)
    const byUsers = await userService.getUsers(byUserIds)
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
        embeds.push(embed)
        fields = []
        sum = 0
    }
    let message = ''
    for (const suspension of suspensions) {
        const username = users.find(user => user.id === suspension.userId).name
        const byUser = byUsers.find(user => user.id === suspension.by)
        const role = groupService.getAbbreviationByRank(suspension.rank)
        const rankback = suspension.rankback === 1 ? 'yes' : 'no'
        const dateString = timeHelper.getDate(suspension.at * 1000)
        const duration = suspension.duration / 86400
        const line = `**${username}** (${role}, rankback **${rankback}**) by **${byUser.name}** at **${dateString}** ` +
        `for **${duration} ${pluralize('day', duration)}** with reason:\n*${suspension.reason}*`
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
    embeds[0].setTitle('Current Suspensions')
    return embeds
}

exports.getEmojiFromNumber = number => {
    switch (number) {
        case 1: return '1⃣'
        case 2: return '2⃣'
        case 3: return '3⃣'
        case 4: return '4⃣'
        case 5: return '5⃣'
        case 6: return '6⃣'
        case 7: return '7⃣'
        case 8: return '8⃣'
        case 9: return '9⃣'
        case 10: return '🔟'
    }
}

exports.prompt = async (channel, author, message) => {
    const filter = (reaction, user) => (reaction.emoji.name === '✅' || reaction.emoji.name === '🚫') && user.id
        === author.id
    const collector = message.createReactionCollector(filter, { time: 60000 })
    const promise = new Promise(resolve => {
        collector.on('end', collected => {
            const reaction = collected.first()
            resolve(reaction && reaction.emoji.name === '✅')
        })
    })
    collector.on('collect', collector.stop)
    await message.react('✅')
    await message.react('🚫')
    return promise
}

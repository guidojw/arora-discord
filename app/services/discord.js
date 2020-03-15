'use strict'
const groupService = require('./group')
const timeHelper = require('../helpers/time')
const BotEmbed = require('../views/bot-embed')

exports.getActivityFromNumber = num => {
    return num === 0 && 'Playing' || num === 1 && 'Streaming' || num === 2 && 'Listening to' || num === 3 && 'Watching'
}

exports.getMemberByName = (guild, name) => {
    const members = guild.members.array()
    let foundMember = null
    members.forEach(member => {
        if (member.displayName.toLowerCase() === name.toLowerCase()) {
            foundMember = member
        }
    })
    return foundMember
}

exports.isAdmin = (member, adminRoles) => {
    for (const roleId of adminRoles) {
        if (member.roles.cache.has(roleId)) return true
    }
    return false
}

exports.updateRoles = async (member, rank, roles) => {
    if (rank === 2) {
        if (!member.roles.cache.has(roles.suspendedRole)) {
            await member.roles.add(roles.suspendedRole)
        }
        if (member.roles.cache.has(roles.mrRole)) {
            await member.roles.remove(roles.mrRole)
        }
        if (member.roles.cache.has(roles.representativeRole)) {
            await member.roles.remove(roles.representativeRole)
        }
        if (member.roles.cache.has(roles.staffCoordinatorRole)) {
            await member.roles.remove(roles.staffCoordinatorRole)
        }
        if (member.roles.cache.has(roles.operationsCoordinatorRole)) {
            await member.roles.remove(roles.operationsCoordinatorRole)
        }
        if (member.roles.cache.has(roles.trainDriverRole)) {
            await member.roles.remove(roles.trainDriverRole)
        }
        if (member.roles.cache.has(roles.conductorRole)) {
            await member.roles.remove(roles.conductorRole)
        }
        if (member.roles.cache.has(roles.customerServiceRepresentativeRole)) {
            await member.roles.remove(roles.customerServiceRepresentativeRole)
        }
    } else {
        if (member.roles.cache.has(roles.suspendedRole)) {
            await member.roles.remove(roles.suspendedRole)
        }
        if (rank < 100 && member.roles.cache.has(roles.mrRole)) {
            await member.roles.remove(roles.mrRole)
        }
        if (rank !== 100 && member.roles.cache.has(roles.representativeRole)) {
            await member.roles.remove(roles.representativeRole)
        }
        if (rank !== 101 && member.roles.cache.has(roles.staffCoordinatorRole)) {
            await member.roles.remove(roles.staffCoordinatorRole)
        }
        if (rank !== 102 && member.roles.cache.has(roles.operationsCoordinatorRole)) {
            await member.roles.remove(roles.operationsCoordinatorRole)
        }
        if (rank !== 3 && member.roles.cache.has(roles.trainDriverRole)) {
            await member.roles.remove(roles.trainDriverRole)
        }
        if (rank !== 4 && member.roles.cache.has(roles.conductorRole)) {
            await member.roles.remove(roles.conductorRole)
        }
        if (rank !== 5 && member.roles.cache.has(roles.customerServiceRepresentativeRole)) {
            await member.roles.remove(roles.customerServiceRepresentativeRole)
        }
        if (rank >= 100 && rank <= 102 && !member.roles.cache.has(roles.mrRole)) {
            await member.roles.add(roles.mrRole)
        }
        if (rank === 100 && !member.roles.cache.has(roles.representativeRole)) {
            await member.roles.add(roles.representativeRole)
        } else if (rank === 101 && !member.roles.cache.has(roles.staffCoordinatorRole)) {
            await member.roles.add(roles.staffCoordinatorRole)
        } else if (rank === 102 && !member.roles.cache.has(roles.operationsCoordinatorRole)) {
            await member.roles.add(roles.operationsCoordinatorRole)
        } else if (rank === 3 && !member.roles.cache.has(roles.trainDriverRole)) {
            await member.roles.add(roles.trainDriverRole)
        } else if (rank === 4 && !member.roles.cache.has(roles.conductorRole)) {
            await member.roles.add(roles.conductorRole)
        } else if (rank === 5 && !member.roles.cache.has(roles.customerServiceRepresentativeRole)) {
            await member.roles.add(roles.customerServiceRepresentativeRole)
        }
    }
}

exports.getTrainingEmbeds = trainings => {
    const embeds = []
    let fields = []
    let sum = 0
    const addField = message => {
        message = message.trim()
        fields.push({ name: 'Upcoming trainings', value: message })
    }
    const addEmbed = () => {
        const embed = new BotEmbed()
            .addFields(fields)
        embeds.push(embed)
        fields = []
        sum = 0
    }
    let message = ''
    trainings.forEach(training => {
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
    })
    const addition = message.length + 8
    if (sum + addition > 6000) {
        addEmbed()
    }
    addField(message)
    addEmbed()
    return embeds
}

exports.getTrainingAnnouncement = (training, guild) => {
    const role = groupService.getRoleByAbbreviation(training.type)
    const dateString = timeHelper.getDate(training.date * 1000)
    const timeString = timeHelper.getTime(training.date * 1000)
    const by = training.by
    const specialNotes = training.specialnotes
    return `${guild.emojis.get('248922413599817728')} **TRAINING**\nThere will be a *${role}* training on **` +
        `${dateString}**.\nTime: **${timeString} ${timeHelper.isDst(training.date * 1000) && 'CEST' || 'CET'}**.` +
        `\n${specialNotes && specialNotes + '\n' || ''}Hosted by **${by}**.\n@everyone`
}

exports.getBanEmbeds = bans => {
    const embeds = []
    let fields = []
    let sum = 0
    const addField = message => {
        message = message.trim()
        fields.push({ name: 'Bans', value: message })
    }
    const addEmbed = () => {
        const embed = new BotEmbed()
            .addFields(fields)
        embeds.push(embed)
        fields = []
        sum = 0
    }
    let message = ''
    bans.forEach(ban => {
        const userId = parseInt(ban.userId)
        const rank = ban.rank
        const byId = ban.by !== 0 ? ban.by : '??'
        const at = ban.at
        const reason = ban.reason ? ban.reason : '??'
        const role = rank ? groupService.getAbbreviationByRank(rank) : '??'
        const dateString = at ? timeHelper.getDate(at * 1000) : '??'
        const line = `**${userId}** (**${role}**) by **${byId}** at **${dateString}** with reason "*${reason}*"`
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
        message += (line + '\n')
    })
    const addition = message.length + 8
    if (sum + addition > 6000) {
        addEmbed()
    }
    addField(message)
    addEmbed()
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

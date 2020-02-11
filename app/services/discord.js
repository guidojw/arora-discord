'use strict'
const discord = require('discord.js')

const groupService = require('./group')
const timeHelper = require('../helpers/time')

const commands = require('../content/commands')

exports.getActivityFromNumber = num => {
    return num === 0 && 'Playing' || num === 1 && 'Streaming' || num === 2 && 'Listening to' || num === 3 && 'Watching'
}

exports.getMemberByName = (guild, name) => {
    const members = guild.members.array()
    let foundMember = null
    members.forEach(member => {
        const username = member.nickname !== null ? member.nickname : member.user.username
        if (username && username.toLowerCase() === name.toLowerCase()) {
            foundMember = member
        }
    })
    return foundMember
}

exports.getEmbed = (title, text) => {
    return exports.compileRichEmbed([{title: title, message: text}])
}

exports.compileRichEmbed = (fields, opts) => {
    fields = fields || []
    opts = opts || {}
    let embed = opts.original
    if (!embed) {
        embed = new discord.RichEmbed()
            .setAuthor('NSadmin', 'https://image.prntscr.com/image/ltRs7okBRVGs8KLf4a-fCw.png')
            .setColor([255, 174, 12])
    }
    if (opts.timestamp) {
        embed.setTimestamp(opts.timestamp)
    } else {
        embed.setTimestamp()
    }
    if (opts.title) embed.setTitle(opts.title)
    for (let i = 0; i < Math.min(fields.length, 25); i++) {
        let title = fields[i].title
        let message = fields[i].message
        if (title && title.length > 256) {
            title = title.substring(0, 253) + '...'
            console.log(`Shortened title ${title}, 256 characters is max.`)
        }
        if (message && message.length > 2048) {
            message = message.substring(0, 2045) + '...'
            console.log(`Shortened message ${message}, 2048 characters is max.`)
        }
        embed.addField(fields[i].title || '?', fields[i].message || '-')
    }
    if (fields.length > 25) {
        console.log(`Ignored ${fields.length - 25} fields, 25 is max.`)
    }
    return embed
}


exports.hasRole = (member, name) => {
    return member.roles.some(role => role.name === name)
}

exports.isAdmin = member => {
    return exports.hasRole(member, 'HR')
}

exports.extractText = (str, delimiter) => {
    if (str && delimiter) {
        if (str.indexOf(delimiter) !== str.lastIndexOf(delimiter)) {
            const firstIndex = str.indexOf(delimiter) + 1
            const lastIndex = str.lastIndexOf(delimiter)
            return str.substring(firstIndex, lastIndex)
        }
    }
}

exports.getCmdEmbeds = () => {
    const embeds = []
    let fields = []
    let sum = 0
    const addField = (title, message) => {
        message = message.trim()
        fields.push({title: title, message: message})
    }
    const addEmbed = () => {
        embeds.push(exports.compileRichEmbed(fields, {title: 'Commands'}))
        fields = []
        sum = 0
    }
    commands.forEach(group => {
        let message = ''
        group.commands.forEach(line => {
            const addition = line.length + group.title.length
            if (sum + addition <= 6000) {
                if (message.length + line.length <= 1024) {
                    sum += line.length
                } else {
                    addField(group.title, message)
                    message = ''
                    sum += addition
                }
            } else {
                addField(group.title, message)
                message = ''
                addEmbed()
            }
            message += (line + '\n')
        })
        const addition = message.length + group.title.length
        if (sum + addition > 6000) {
            addEmbed()
        }
        addField(group.title, message)
        sum += addition
    })
    addEmbed()
    return embeds
}

exports.updateRoles = async (guild, member, rank) => {
    if (rank === 2) {
        if (!exports.hasRole(member, 'Suspended')) {
            await member.addRole(guild.roles.find(role => role.name === 'Suspended'))
        }
        if (exports.hasRole(member, 'MR')) {
            await member.removeRole(guild.roles.find(role => role.name === 'MR'))
        }
        if (exports.hasRole(member, 'Representative')) {
            await member.removeRole(guild.roles.find(role => role.name === 'Representative'))
        }
        if (exports.hasRole(member, 'Staff Coordinator')) {
            await member.removeRole(guild.roles.find(role => role.name === 'Staff Coordinator'))
        }
        if (exports.hasRole(member, 'Operations Coordinator')) {
            await member.removeRole(guild.roles.find(role => role.name === 'Operations Coordinator'))
        }
        if (exports.hasRole(member, 'Train Driver')) {
            await member.removeRole(guild.roles.find(role => role.name === 'Train Driver'))
        }
        if (exports.hasRole(member, 'Conductor')) {
            await member.removeRole(guild.roles.find(role => role.name === 'Conductor'))
        }
        if (exports.hasRole(member, 'Customer Service Representative')) {
            await member.removeRole(guild.roles.find(role => role.name === 'Customer Service Representative'))
        }
    } else {
        if (exports.hasRole(member, 'Suspended')) {
            await member.removeRole(guild.roles.find(role => role.name === 'Suspended'))
        }
        if (rank < 100 && exports.hasRole(member, 'MR')) {
            await member.removeRole(guild.roles.find(role => role.name === 'MR'))
        }
        if (rank !== 100 && exports.hasRole(member, 'Representative')) {
            await member.removeRole(guild.roles.find(role => role.name === 'Representative'))
        }
        if (rank !== 101 && exports.hasRole(member, 'Staff Coordinator')) {
            await member.removeRole(guild.roles.find(role => role.name === 'Staff Coordinator'))
        }
        if (rank !== 102 && exports.hasRole(member, 'Operations Coordinator')) {
            await member.removeRole(guild.roles.find(role => role.name === 'Operations Coordinator'))
        }
        if (rank !== 3 && exports.hasRole(member, 'Train Driver')){
            await member.removeRole(guild.roles.find(role => role.name === 'Train Driver'))
        }
        if (rank !== 4 && exports.hasRole(member, 'Conductor')){
            await member.removeRole(guild.roles.find(role => role.name === 'Conductor'))
        }
        if (rank !== 5 && exports.hasRole(member, 'Customer Service Representative')){
            await member.removeRole(guild.roles.find(role => role.name === 'Customer Service Representative'))
        }
        if (rank >= 100 && rank <= 102 && !exports.hasRole(member, 'MR')) {
            await member.addRole(guild.roles.find(role => role.name === 'MR'))
        }
        if (rank === 100 && !exports.hasRole(member, 'Representative')) {
            await member.addRole(guild.roles.find(role => role.name === 'Representative'))
        } else if (rank === 101 && !exports.hasRole(member, 'Staff Coordinator')) {
            await member.addRole(guild.roles.find(role => role.name === 'Staff Coordinator'))
        } else if (rank === 102 && !exports.hasRole(member, 'Operations Coordinator')) {
            await member.addRole(guild.roles.find(role => role.name === 'Operations Coordinator'))
        } else if (rank === 3 && !exports.hasRole(member, 'Train Driver')) {
            await member.addRole(guild.roles.find(role => role.name === 'Train Driver'))
        } else if (rank === 4 && !exports.hasRole(member, 'Conductor')) {
            await member.addRole(guild.roles.find(role => role.name === 'Conductor'))
        } else if (rank === 5 && !exports.hasRole(member, 'Customer Service Representative')) {
            await member.addRole(guild.roles.find(role => role.name === 'Customer Service Representative'))
        }
    }
}

exports.getTrainingEmbeds = trainings => {
    const embeds = []
    let fields = []
    let sum = 0
    const addField = message => {
        message = message.trim()
        fields.push({title: 'Upcoming trainings', message: message})
    }
    const addEmbed = () => {
        embeds.push(exports.compileRichEmbed(fields, {title: 'Trainings'}))
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
        fields.push({title: 'Bans', message: message})
    }
    const addEmbed = () => {
        embeds.push(exports.compileRichEmbed(fields, {title: 'Bans'}))
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

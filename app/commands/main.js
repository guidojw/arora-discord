'use strict'
require('dotenv').config()

const pluralize = require('pluralize')
const { RichEmbed } = require('discord.js')

const discordService = require('../services/discord')
const groupService = require('../services/group')
const userService = require('../services/user')

const timeHelper = require('../helpers/time')
const stringHelper = require('../helpers/string')

const applicationAdapter = require('../adapters/application')

const InputError = require('../errors/input-error')
const ApplicationError = require('../errors/application-error')
const PermissionError = require('../errors/permission-error')

const activities = require('../content/activities')

const applicationConfig = require('../../config/application')

let activitiesString = ''

exports.amiadmin = async req => {
    if (req.args[0]) {
        const member = discordService.getMemberByName(req.guild, req.args[0])
        if (!member) throw new ApplicationError(`Couldn't find **${req.args[0]}** in server.`)
        if (discordService.isAdmin(member, req.config.adminRoles)) {
            req.channel.send(discordService.getEmbed(req.command, `Yes, **${member.nickname !== null ? member
                .nickname : member.user.username}** is admin.`))
        } else {
            req.channel.send(discordService.getEmbed(req.command, `No, **${member.nickname !== null ? member
                .nickname : member.user.username}** is not admin.`))
        }
    } else {
        if (discordService.isAdmin(req.member, req.config.adminRoles)) {
            req.channel.send(discordService.getEmbed(req.command, `Yes, you are admin!`))
        } else {
            req.channel.send(discordService.getEmbed(req.command, `No, you're not admin.`))
        }
    }
}

exports.isadmin = async req => {
    await exports.amiadmin(req)
}

exports.reason = async req => {
    if (req.args[0] && !discordService.isAdmin(req.member, req.config.adminRoles)) throw new PermissionError()
    const username = req.args[0] ? req.args[0] : req.member.nickname !== null ? req.member.nickname : req.author
        .username
    const userId = await userService.getIdFromUsername(username)
    const suspension = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}` +
        `/suspensions/${userId}`)).data
    if (suspension) {
        const days = suspension.duration / 86400
        await req.channel.send(discordService.compileRichEmbed([{
            title: req.args[0] ? `${username} is suspended for`: 'You\'re suspended for',
            message: `${days} ${pluralize('day', days)}`
        }, {
            title: 'Reason',
            message: `*"${suspension.reason}"*`
        }]))
    } else {
        req.channel.send('Couldn\'t find suspension!')
    }
}

exports.suspendinfo = async req => {
    await exports.reason(req)
}

exports.getshout = async req => {
    const shout = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/shout`))
        .data
    if (shout.body !== '') {
        await req.channel.send(discordService.compileRichEmbed([{
            title: `Current shout by ${shout.poster.username}`,
            message: shout.body,
        }], {timestamp: shout.updated}))
    } else {
        req.channel.send('There currently is no shout.')
    }
}

exports.groupshout = async req => {
    await exports.getshout(req)
}

exports.suggest = async req => {
    if (req.args.length === 0) throw new InputError('Please enter a suggestion.')
    const suggestion = req.args.join(' ')
    const embed = new RichEmbed()
        .setDescription(suggestion)
        .setAuthor(req.author.tag, req.author.displayAvatarURL, req.author.url)
    if (req.message.attachments.size > 0) {
        const attachment = req.message.attachments.first()
        if (attachment.height) embed.setImage(attachment.url)
    }
    const message = await req.guild.channels.find(channel => channel.id === req.config.channels.suggestions)
        .send(embed)
    await message.react('✔')
    await message.react('✖')
    await message.react('❔')
    await req.channel.send('Successfully suggested', { embed: embed })
}

exports.delete = async req => {
    const channel = req.guild.channels.find(channel => channel.id === req.config.channels.suggestions)
    const messages = await channel.fetchMessages()
    for (const suggestion of messages.values()) {
        if (suggestion.embeds.length === 1 && suggestion.embeds[0].author.name === req.author.tag && suggestion.id !==
            req.config.firstSuggestionMessageId) {
            const choice = await discordService.prompt(req.channel, req.author, 'Are you sure you would like' +
                ' to delete this suggestion?', { embed: suggestion.embeds[0]})
            if (choice) {
                await suggestion.delete()
                req.channel.send('Successfully deleted your last suggestion.')
            } else {
                req.channel.send('Didn\'t delete your last suggestion.')
            }
            return
        }
    }
    req.channel.send('Could not find a suggestion you made.')
}

exports.userid = async req => {
    const username = req.args[0] ? req.args[0] : req.member.nickname !== null ? req.member.nickname : req.author
        .username
    const userId = await userService.getIdFromUsername(username)
    req.channel.send(discordService.getEmbed(req.command, `**${username}** has userId **${userId}**.`))
}

exports.getuserid = async req => {
    await exports.userid(req)
}

exports.rank = async req => {
    const username = req.args[0] ? req.args[0] : req.member.nickname !== null ? req.member.nickname : req.author
        .username
    const userId = await userService.getIdFromUsername(username)
    const rank = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/rank/` +
        userId))
        .data
    req.channel.send(discordService.getEmbed(req.command, `**${username}** has rank **${rank}**.`))
}

exports.getrank = async req => {
    await exports.rank(req)
}

exports.role = async req => {
    const username = req.args[0] ? req.args[0] : req.member.nickname !== null ? req.member.nickname : req.author
        .username
    const userId = await userService.getIdFromUsername(username)
    const role = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/role/` +
        userId))
        .data
    req.channel.send(discordService.getEmbed(req.command, `**${username}** has role **${role}**.`))
}

exports.getrole = async req => {
    await exports.role(req)
}

exports.joindate = async req => {
    const username = req.args[0] ? req.args[0] : req.member.nickname !== null ? req.member.nickname : req.author
        .username
    const userId = await userService.getIdFromUsername(username)
    const joinDate = new Date((await applicationAdapter('get', `/v1/users/${userId}/join-date`))
        .data)
    req.channel.send(discordService.getEmbed(req.command, `**${username}** joined Roblox on **${timeHelper.getDate(
        timeHelper.getUnix(joinDate) * 1000)}**.`))
}

exports.age = async req => {
    const username = req.args[0] ? req.args[0] : req.member.nickname !== null ? req.member.nickname : req.author
        .username
    const userId = await userService.getIdFromUsername(username)
    const joinDate = new Date((await applicationAdapter('get', `/v1/users/${userId}/join-date`))
        .data)
    const age = Math.floor((timeHelper.getUnix() - timeHelper.getUnix(joinDate)) / 86400)
    req.channel.send(discordService.getEmbed(req.command, `**${username}**'s Roblox account is **${age} ${pluralize(
        'day', age)}** old.`))
}

exports.playerurl = async req => {
    const username = req.args[0] ? req.args[0] : req.member.nickname !== null ? req.member.nickname : req.author
        .username
    const userId = await userService.getIdFromUsername(username)
    req.channel.send(`https://www.roblox.com/users/${userId}/profile`)
}

exports.url = async req => {
    await exports.playerurl(req)
}

exports.suggestqotd = async req => {
    const username = req.member.nickname !== null ? req.member.nickname : req.author.username
    if (req.args.length === 0) throw new InputError('Please enter a QOTD suggestion between *double* quotation marks.')
    const qotd = req.args.join(' ')
    await applicationAdapter('post', '/v1/qotds', {
        by: username,
        qotd: qotd
    })
    req.channel.send(discordService.getEmbed('Successfully suggested QOTD', `"*${qotd}*"`))
}

exports.activities = async req => {
    req.channel.send(discordService.getEmbed('Activities', activitiesString))
}

exports.statuses = async req => {
    await exports.activities(req)
}

exports.update = async req => {
    const username = req.args[0] ? req.args[0] : req.member.nickname !== null ? req.member.nickname : req.author
        .username
    let member = req.member
    if (req.args[0]) {
        if (!discordService.isAdmin(req.member, req.config.adminRoles)) throw new PermissionError()
        member = discordService.getMemberByName(req.guild, username)
    }
    if (!member) throw new InputError(`**${username}** is not in this server.`)
    const userId = await userService.getIdFromUsername(username)
    const rank = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/rank/` +
        userId)).data
    await discordService.updateRoles(req.guild, member, rank)
    req.channel.send(`Successfully checked **${username}**'s roles.`)
}

exports.notdutch = async req => {
    if (!discordService.hasRole(req.member, 'Not Dutch')) {
        await req.member.addRole(req.guild.roles.find(role => role.name === 'Not Dutch'))
        req.channel.send('Successfully updated roles.')
    } else {
        req.channel.send('You already have the Not Dutch role.')
    }
}

exports.trainings = async req => {
    const trainings = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}` +
        '/trainings')).data
    if (trainings.length === 0) {
        req.channel.send('There are currently no hosted trainings.')
        return
    }
    const id = parseInt(req.args[0])
    if (id) {
        for await (const training of trainings) {
            if (training.id === id) {
                req.channel.send(discordService.getEmbed(`Training ID: ${training.id}`, groupService
                    .getTrainingSentence(training)))
                return
            }
        }
        req.channel.send(`Couldn't find info for Training ID **${id}**.`)
    } else {
        const trainingEmbeds = discordService.getTrainingEmbeds(trainings)
        const channel = await req.member.createDM()
        for (const embed of trainingEmbeds) {
            await channel.send(embed)
        }
    }
}

exports.traininginfo = async req => {
    await exports.trainings(req)
}

exports.traininglist = async req => {
    await exports.trainings(req)
}

exports.training = async req => {
    await exports.trainings(req)
}

exports.optout = async req => {
    if (!discordService.hasRole(req.member, 'No Training Announcements')) {
        await req.member.addRole(req.guild.roles.find(role => role.name === 'No Training Announcements'))
        req.channel.send('Successfully opted out.')
    } else {
        req.channel.send('You\'re already opted out.')
    }
}

exports.optin = async req => {
    if (discordService.hasRole(req.member, 'No Training Announcements')) {
        await req.member.removeRole(req.guild.roles.find(role => role.name === 'No Training Announcements'))
        req.channel.send('Successfully opted in.')
    } else {
        req.channel.send('You\'re already opted in.')
    }
}

exports.poll = async req => {
    const username = req.member.nickname !== null ? req.member.nickname : req.author.username
    const poll = await stringHelper.extractText(req.message.content, '"')
    if (!poll) throw new InputError('Please enter a poll between *double* quotation marks.')
    const options = []
    for (let num = 1; num <= 10; num++) {
        if (req.message.content.indexOf(`(${num})`) !== -1) {
            options.push(num)
        }
    }
    const message = await req.channel.send(discordService.getEmbed(`Poll by ${username}:`, poll).setFooter(
        'Vote using the reactions!'))
    if (options.length > 0) {
        for (const option of options) {
            await message.react(discordService.getEmojiFromNumber(option))
        }
    } else {
        await message.react('✔')
        await message.react('✖')
    }
}

exports.badges = async req => {
    const username = req.args[0] ? req.args[0] : req.member.nickname !== null ? req.member.nickname : req.author
        .username
    const userId = await userService.getIdFromUsername(username)
    const hasTtdt = await userService.hasBadge(userId, applicationConfig.ttdtId)
    const hasPtdt = await userService.hasBadge(userId, applicationConfig.ptdtId)
    const hasTcdt = await userService.hasBadge(userId, applicationConfig.tcdtId)
    const embed = new RichEmbed()
        .setTitle(`${username}'s badges:`)
        .addField('TTDT', hasTtdt ? 'yes' : 'no', true)
        .addField('PTDT', hasPtdt ? 'yes' : 'no', true)
        .addField('TCDT', hasTcdt ? 'yes' : 'no', true)
    await req.channel.send(embed)
}

{
    activities.forEach((activity, index) => {
        activitiesString += `${index + 1}. **${discordService.getActivityFromNumber(activity.options.type)}** ` +
            `${activity.name}\n`
    })
}

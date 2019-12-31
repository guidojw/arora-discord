'use strict'
require('dotenv').config()

const base = require('path').resolve('.')
const pluralize = require('pluralize')

const discordHelper = require('../helpers/discord')
const timeHelper = require('../helpers/time')
const groupHelper = require('../helpers/group')
const userHelper = require('../helpers/user')
const stringHelper = require('../helpers/string')

const applicationAdapter = require('../adapters/application')

const InputError = require('../errors/input-error')
const ApplicationError = require('../errors/application-error')
const PermissionError = require('../errors/permission-error')

const activities = require('../content/activities')

const config = require(base + "/config/application")

let activitiesString = ''

exports.amiadmin = async req => {
    if (req.args[0]) {
        const member = discordHelper.getMemberByName(req.guild, req.args[0])
        if (!member) throw new ApplicationError(`Couldn't find **${req.args[0]}** in server.`)
        if (discordHelper.isAdmin(member)) {
            req.channel.send(discordHelper.getEmbed(req.command, `Yes, **${member.nickname}** is admin.`))
        } else {
            req.channel.send(discordHelper.getEmbed(req.command, `No, **${member.nickname}** is not admin.`))
        }
    } else {
        if (discordHelper.isAdmin(req.member)) {
            req.channel.send(discordHelper.getEmbed(req.command, `Yes, you are admin!`))
        } else {
            req.channel.send(discordHelper.getEmbed(req.command, `No, you're not admin.`))
        }
    }
}

exports.isadmin = async req => {
    await exports.amiadmin(req)
}

exports.reason = async req => {
    if (req.args[0] && !discordHelper.isAdmin(req.member)) throw new PermissionError()
    const username = req.args[0] ? req.args[0] : req.member.nickname ? req.member.nickname : req.author.username
    const userId = await userHelper.getIdFromUsername(username)
    const suspension = (await applicationAdapter('get', `/v1/groups/${config.groupId}/suspensions/` +
    userId)).data
    if (suspension) {
        const days = suspension.duration / 86400
        req.channel.send(discordHelper.compileRichEmbed([{
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
    const shout = (await applicationAdapter('get', `/v1/groups/${config.groupId}/shout`)).data
    if (shout.body !== '') {
        req.channel.send(discordHelper.compileRichEmbed([{
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
    const suggestion = await discordHelper.extractText(req.message.content, '"')
    if (!suggestion) throw new InputError('Please enter a suggestion between *double* quotation marks.')
    req.channel.send(discordHelper.compileRichEmbed([{
        title: 'Successfully suggested', message: `*"${suggestion}"*`
    }]))
    const suggestionsChannel = await req.guild.channels.find(channel => channel.name === 'suggestions')
    const message = await suggestionsChannel.send(discordHelper.compileRichEmbed([{
        title: `**${req.member.nickname}** suggested`,
        message: `*"${suggestion}"*`
    }]).setFooter('Vote using the reactions!'))
    await message.react('✔')
    await message.react('✖')
}

exports.userid = async req => {
    const username = req.args[0] ? req.args[0] : req.member.nickname ? req.member.nickname : req.author.username
    const userId = await userHelper.getIdFromUsername(username)
    req.channel.send(discordHelper.getEmbed(req.command, `**${username}** has userId **${userId}**.`))
}

exports.getuserid = async req => {
    await exports.userid(req)
}

exports.rank = async req => {
    const username = req.args[0] ? req.args[0] : req.member.nickname ? req.member.nickname : req.author.username
    const userId = await userHelper.getIdFromUsername(username)
    const rank = (await applicationAdapter('get', `/v1/groups/${config.groupId}/rank/${userId}`))
        .data
    req.channel.send(discordHelper.getEmbed(req.command, `**${username}** has rank **${rank}**.`))
}

exports.getrank = async req => {
    await exports.rank(req)
}

exports.role = async req => {
    const username = req.args[0] ? req.args[0] : req.member.nickname ? req.member.nickname : req.author.username
    const userId = await userHelper.getIdFromUsername(username)
    const role = (await applicationAdapter('get', `/v1/groups/${config.groupId}/role/${userId}`))
        .data
    req.channel.send(discordHelper.getEmbed(req.command, `**${username}** has role **${role}**.`))
}

exports.getrole = async req => {
    await exports.role(req)
}

exports.joindate = async req => {
    const username = req.args[0] ? req.args[0] : req.member.nickname ? req.member.nickname : req.author.username
    const userId = await userHelper.getIdFromUsername(username)
    const joinDate = new Date((await applicationAdapter('get', `/v1/users/${userId}/join-date`))
        .data)
    req.channel.send(discordHelper.getEmbed(req.command, `**${username}** joined Roblox on **${timeHelper.getDate(
        timeHelper.getUnix(joinDate) * 1000)}**.`))
}

exports.age = async req => {
    const username = req.args[0] ? req.args[0] : req.member.nickname ? req.member.nickname : req.author.username
    const userId = await userHelper.getIdFromUsername(username)
    const joinDate = new Date((await applicationAdapter('get', `/v1/users/${userId}/join-date`))
        .data)
    const age = Math.floor((timeHelper.getUnix() - timeHelper.getUnix(joinDate)) / 86400)
    req.channel.send(discordHelper.getEmbed(req.command, `**${username}**'s Roblox account is **${age} ${pluralize(
        'day', age)}** old.`))
}

exports.playerurl = async req => {
    const username = req.args[0] ? req.args[0] : req.member.nickname ? req.member.nickname : req.author.username
    const userId = await userHelper.getIdFromUsername(username)
    req.channel.send(`https://www.roblox.com/users/${userId}/profile`)
}

exports.url = async req => {
    await exports.playerurl(req)
}

exports.suggestqotd = async req => {
    const username = req.member.nickname ? req.member.nickname : req.author.username
    const qotd = await stringHelper.extractText(req.message.content, '"')
    if (!qotd) throw new InputError('Please enter a QOTD suggestion between *double* quotation marks.')
    await applicationAdapter('post', '/v1/qotds', {
        id: process.env.ID,
        key: process.env.KEY,
        by: username,
        qotd: qotd
    })
    req.channel.send(discordHelper.getEmbed('Successfully suggested QOTD', `"*${qotd}*"`))
}

exports.activities = async req => {
    req.channel.send(discordHelper.getEmbed('Activities', activitiesString))
}

exports.statuses = async req => {
    await exports.activities(req)
}

exports.update = async req => {
    const username = req.args[0] ? req.args[0] : req.member.nickname ? req.member.nickname : req.author.username
    let member = req.member
    if (req.args[0]) {
        if (!discordHelper.isAdmin(req.member)) throw new PermissionError()
        member = discordHelper.getMemberByName(req.guild, username)
    }
    if (!member) throw new InputError(`**${username}** is not in this server.`)
    const userId = await userHelper.getIdFromUsername(username)
    const rank = (await applicationAdapter('get', `/v1/groups/${config.groupId}/rank/${userId}`))
        .data
    await discordHelper.updateRoles(req.guild, req.member, rank)
    req.channel.send(`Successfully checked **${username}**'s roles.`)
}

exports.notdutch = async req => {
    if (!discordHelper.hasRole(req.member, 'Not Dutch')) {
        await req.member.addRole(req.guild.roles.find(role => role.name === 'Not Dutch'))
        req.channel.send('Successfully updated roles.')
    } else {
        req.channel.send('You already have the Not Dutch role.')
    }
}

exports.trainings = async req => {
    const trainings = (await applicationAdapter('get', `/v1/groups/${config.groupId}/trainings`))
        .data
    if (trainings.length === 0) {
        req.channel.send('There are currently no hosted trainings.')
        return
    }
    const id = parseInt(req.args[0])
    if (id) {
        for await (const training of trainings) {
            if (training.id === id) {
                req.channel.send(discordHelper.getEmbed(`Training ID: ${training.id}`, groupHelper
                    .getTrainingSentence(training)))
                return
            }
        }
        req.channel.send(`Couldn't find info for Training ID **${id}**.`)
    } else {
        const trainingEmbeds = discordHelper.getTrainingEmbeds(trainings)
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
    if (!discordHelper.hasRole(req.member, 'No Training Announcements')) {
        await req.member.addRole(req.guild.roles.find(role => role.name === 'No Training Announcements'))
        req.channel.send('Successfully opted out.')
    } else {
        req.channel.send('You\'re already opted out.')
    }
}

exports.optin = async req => {
    if (discordHelper.hasRole(req.member, 'No Training Announcements')) {
        await req.member.removeRole(req.guild.roles.find(role => role.name === 'No Training Announcements'))
        req.channel.send('Successfully opted in.')
    } else {
        req.channel.send('You\'re already opted in.')
    }
}

exports.poll = async req => {
    const username = req.member.nickname ? req.member.nickname : req.author.username
    const poll = await stringHelper.extractText(req.message.content, '"')
    if (!poll) throw new InputError('Please enter a poll between *double* quotation marks.')
    const options = []
    for (let num = 1; num < 10; num++) {
        if (poll.indexOf(`(${num})`) !== -1) {
            options.push(num)
        }
    }
    const message = await req.channel.send(discordHelper.getEmbed(`Poll by ${username}:`, poll).setFooter(
        'Vote using the reactions!'))
    if (options.length > 0) {
        options.forEach(option => {
            message.react(req.client.emojis.find(emoji => emoji.name === discordHelper.getEmojiNameFromNumber(option
            )))
        })
    } else {
        await message.react('✔')
        await message.react('✖')
    }
}

{
    activities.forEach((activity, index) => {
        activitiesString += `${index + 1}. **${discordHelper.getActivityFromNumber(activity.options.type)}** ` +
            `${activity.name}\n`
    })
}

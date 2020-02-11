'use strict'
const base = require('path').resolve('.')

const discordService = require('../services/discord')

const timeHelper = require('../helpers/time')

const applicationAdapter = require('../adapters/application')

const InputError = require('../errors/input-error')

const applicationConfig = require(base + '/config/application')

exports.rr = req => {
    req.channel.send(`<${applicationConfig.rulesRegulationsLink}> - Rules & Regulations`)
}

exports.rulesregulations = req => {
    exports.rr(req)
}

exports.group = req => {
    req.channel.send(`<${applicationConfig.groupLink}> - Group Page`)
}

exports.grouppage = req => {
    exports.group(req)
}

exports.grouplink = req => {
    exports.group(req)
}

exports.game = req => {
    req.channel.send(`<${applicationConfig.gameLink}> - Game Page`)
}

exports.gamepage = req => {
    exports.game(req)
}

exports.trello = req => {
    req.channel.send(`<${applicationConfig.trelloLink}> - Trello Dev Board`)
}

exports.ttdt = req => {
    req.channel.send(`<${applicationConfig.theoreticalTrainDriverTestLink}> - Theoretical Train Driver Test II`)
}

exports.theoretical = req => {
    exports.ttdt(req)
}

exports.ptdt = req => {
    req.channel.send(`<${applicationConfig.practicalTrainDriverTestLink}> - Practical Train Driver Test II`)
}

exports.practical = req => {
    exports.ptdt(req)
}

exports.time = async req => {
    let date
    if (req.args[0]) {
        const timezone = await timeHelper.getPlaceFromTimezone(req.args[0])
        if (!timezone) throw new InputError(`Unknown Timezone: '**${req.args[0]}**'`)
        date = timeHelper.getTimeInTimezone(timezone)
    } else {
        date = timeHelper.getTimeInTimezone('Europe/Amsterdam')
    }
    const hours = ('0' + date.getHours()).slice(-2)
    const minutes = ('0' + date.getMinutes()).slice(-2)
    const timeString = hours + ':' + minutes
    req.channel.send(discordService.getEmbed('time', timeString))
}

exports.date = async req => {
    let date
    if (req.args[0]) {
        const timezone = await timeHelper.getPlaceFromTimezone(req.args[0])
        if (!timezone) throw new InputError(`Unknown Timezone: '**${req.args[0]}**'`)
        date = timeHelper.getTimeInTimezone(timezone)
    } else {
        date = timeHelper.getTimeInTimezone('Europe/Amsterdam')
    }
    req.channel.send(discordService.getEmbed('date', date.toString()))
}

exports.unix = req => {
    req.channel.send(discordService.getEmbed(req.command, timeHelper.getUnix()))
}

exports.epoch = req => {
    exports.unix(req)
}

exports.groupcenter = req => {
    req.channel.send(`<${applicationConfig.groupCenterLink}> - Group Center`)
}

exports.groupcentre = req => {
    exports.groupcenter(req)
}

exports.gc = req => {
    exports.groupcenter(req)
}

exports.discord = req => {
    req.channel.send(`${applicationConfig.discordLink}`)
}

exports.isdst = async req => {
    await req.channel.send(timeHelper.isDst(timeHelper.getUnix()))
}

exports.isloggedin = async req => {
    try {
        req.channel.send((await applicationAdapter('get', '/v1/status')).data)
    } catch (err) {
        await req.channel.send(false)
    }
}

exports.membercount = async req => {
    let groupId = req.args[0] ? parseInt(req.args[0]) : applicationConfig.groupId
    if (!groupId) throw new InputError('Please enter a group ID.')
    const group = (await applicationAdapter('get', `/v1/groups/${groupId}`)).data
    req.channel.send(discordService.getEmbed(`${group.name} has`, `**${group.memberCount}** members.`))
}

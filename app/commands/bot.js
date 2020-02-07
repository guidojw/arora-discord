'use strict'
const discordService = require('../services/discord')

const timeHelper = require('../helpers/time')

const botController = require('../controllers/bot')

exports.cmds = async req => {
    const embeds = discordService.getCmdEmbeds()
    const channel = await req.member.createDM()
    for (const embed of embeds) {
        await channel.send(embed)
    }
}

exports.commands = async req => {
    await exports.cmds(req)
}

exports.help = async req => {
    await exports.cmds(req)
}

exports.uptime = async req => {
    await req.channel.send(discordService.getEmbed('NSadmin has been online for', `${timeHelper.getUnix() - 
    botController.startUnix}s`))
}

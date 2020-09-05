'use strict'
require('dotenv').config()

const { stripIndents } = require('common-tags')
const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../config/application')

module.exports = [{
    names: ['game'],
    tag: applicationConfig.gameLink
}, {
    names: ['group'],
    tag: applicationConfig.groupLink
}, {
    names: ['groupcenter', 'gc'],
    tag: applicationConfig.groupCenterLink
}, {
    names: ['invite', 'discord'],
    tag: applicationConfig.discordLink
}, {
    names: ['ptdt'],
    tag: applicationConfig.practicalTrainDriverTestLink
}, {
    names: ['rr'],
    tag: applicationConfig.rulesRegulationsLink
}, {
    names: ['tcdt'],
    tag: applicationConfig.theoreticalConductorTestLink
}, {
    names: ['ttdt'],
    tag: applicationConfig.theoreticalTrainDriverTestLink
}, {
    names: ['trello'],
    tag: applicationConfig.trelloLink
}, {
    names: ['uw'],
    tag: applicationConfig.updatesWorkplaceLink
}, {
    names: ['documents', 'docs'],
    group: 'admin',
    tag: stripIndents`
        Training Protocols: <${process.env.TP_DOC}>
        Training Logs: <${process.env.TL_DOC}>
        Malicious Spreadsheets: <${process.env.MS_DOC}>
        `
}, {
    names: ['ms'],
    group: 'admin',
    tag: `<${process.env.MS_DOC}>`
}, {
    names: ['tl'],
    group: 'admin',
    tag: `<${process.env.TL_DOC}>`
}, {
    names: ['tp'],
    group: 'admin',
    tag: `<${process.env.TP_DOC}>`
}, {
    names: ['ticket'],
    tag: new MessageEmbed()
        .setColor(applicationConfig.primaryColor)
        .setTitle('How to create a new support ticket?')
        .setDescription(stripIndents`
            You can create a new ticket by sending <@${process.env.BOT_ID}> a private message. 
            The bot will ask you what type of support you need and will then ask for a clear description of your report.
            
            Once submitted, our Ticket Moderators will respond to your ticket as soon as possible. This may take up to 24 hours. 
            `)
}]

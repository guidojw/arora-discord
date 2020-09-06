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
}, {
    names: ['privacy', 'privacypolicy', 'pp'],
    tag: new MessageEmbed()
        .setColor(applicationConfig.primaryColor)
        .setTitle('Privacy Policy')
        .setDescription('This policy sums up all you need to know about what data we store, what we use it for and what you can do about it.')
        .addField('Stored in a Database', stripIndents`
            - Roblox user IDs: used to indicate admins and targets for infractions and trainings.
            - Roblox user names: for train developer payouts.
            - Discord user IDs: for vote participants and train developer payouts.
            - Parts of message contents: these are always provided by the user and are used for infraction reasons, training notes, vote descriptions and vote participant descriptions.
            
            The database is hosted on a VPS residing in Germany.
            `)
        .addField('Stored in Cache', 'The Discord.js library automatically caches many things that come from Discord directly, they can range from avatars to message contents, to meta parameters such as role colors, names, user tags, user flags (badges). Most of this content is used to provide logs or command output, and is deleted on bot shutdown, as it is put into a volatile storage.')
        .addField('Stored in Discord', 'Output of bot commands that is sent to Discord may include things like names, IDs and icons/avatars. This data cannot be deleted by us as there is no feasible way to do so.')
        .addField('\u200b', 'Official NS Staff have access to the bot\'s logs. These logs are all sent in a private and strictly controlled Discord server. We use logs to provide a safe environment for the bot\'s users as well as for keeping our processes streamlined.')
        .addField('Requesting Data Deletion', 'To request deletion of your data, please contact the Staff at the support server. If you are banned from the server and still want to use your right to deletion, you can instead DM a Staff member through friend requests or mutual servers. Your data is ensured to be deleted within 14 days from your request.')
        .addField('Data Security', stripIndents `
            To ensure no data is unintentionally lost, the Staff will have to verify a few things, such as:
            - Any user may request deletion of infractions of which they were the responsible moderator of.
            - You may not request deletion of infractions that target you, unless consent is given by the server owner.

            The NS Staff reserves the right to modify or delete any data at any given time, without notice or warning.
            `)
}]

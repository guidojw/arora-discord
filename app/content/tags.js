'use strict'
require('dotenv').config()

const { stripIndents } = require('common-tags')

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
    tag: stripIndents`Training Protocols: <${process.env.TP_DOC}>
            Training Logs: <${process.env.TL_DOC}>
            Malicious Spreadsheets: <${process.env.MS_DOC}>`
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
}]

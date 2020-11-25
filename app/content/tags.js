'use strict'
const { stripIndents } = require('common-tags')
const { MessageEmbed } = require('discord.js')

/* eslint-disable max-len */
module.exports = [{
  names: ['game'],
  tag: 'https://www.roblox.com/games/140576204/NS-Games-Universe'
}, {
  names: ['group'],
  tag: 'https://www.roblox.com/Groups/group.aspx?gid=1018818'
}, {
  names: ['groupcenter', 'gc'],
  tag: 'https://www.roblox.com/games/348800431/Group-Center'
}, {
  names: ['invite', 'discord'],
  tag: 'https://discord.gg/nZE8dXM'
}, {
  names: ['ptdt'],
  tag: 'https://www.roblox.com/games/496933015/Practical-Train-Driver-Test-II'
}, {
  names: ['rr'],
  tag: 'https://devforum.roblox.com/t/ns-rules-and-regulations/63617'
}, {
  names: ['tcdt'],
  tag: 'https://www.roblox.com/games/205328689/Theoretical-Conductor-Test'
}, {
  names: ['ttdt'],
  tag: 'https://www.roblox.com/games/528038240/Theoretical-Train-Driver-Test-II'
}, {
  names: ['trello'],
  tag: 'https://trello.com/b/PDkRNR6G/project-railrunner-dev-board'
}, {
  names: ['uw'],
  tag: 'https://www.roblox.com/games/149045435/UTASD-Updates-Workplace'
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
  names: ['applicationcenter', 'ac'],
  tag: 'https://www.roblox.com/games/4818693758/Application-Center'
}, {
  names: ['mycenter', 'mc'],
  tag: 'https://my-center.net/center/mcv5_center_id:88586895-2d0f-4217-a75f-0fecc5e1911492eded3e-189d-41d6-ae7c-772bbe8a80a2b3fd3f20-4081-4576-bced-691de4c78e9a2e6da9ee-9c65-4503-a02e-9dc02f39714f'
}, {
  names: ['ticket'],
  tag: new MessageEmbed()
    .setTitle('How to create a new support ticket?')
    .setDescription(stripIndents`
    You can create a new ticket by clicking the regarding number in #support.
    If applicable, the bot will ask you for a clear description of your report.

    Once submitted, our Ticket Moderators will respond to your ticket as soon as possible. This may take up to 24 hours, depending on your ticket type.
    `)
}, {
  names: ['privacy', 'privacypolicy', 'pp'],
  tag: new MessageEmbed()
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
    .addField('Data Security', stripIndents`
    To ensure no data is unintentionally lost, the Staff will have to verify a few things, such as:
    - Any user may request deletion of infractions of which they were the responsible moderator of.
    - You may not request deletion of infractions that target you, unless consent is given by the server owner.

    The NS Staff reserves the right to modify or delete any data at any given time, without notice or warning.
    `)
}]
/* eslint-enable max-len */

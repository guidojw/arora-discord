'use strict'
const pluralize = require('pluralize')
const applicationAdapter = require('../../adapters/application')
const BaseCommand = require('../base')
const discordService = require('../../services/discord')
const groupService = require('../../services/group')
const userService = require('../../services/user')
const timeHelper = require('../../helpers/time')

const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

class SuspensionsCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'suspensions',
      aliases: ['suspensionlist', 'suspensioninfo', 'suspension'],
      description: 'Lists info of current suspensions/given user\'s suspension.',
      details: 'Only admins can see the suspensions of others.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Of whose suspension would you like to know the information?',
        default: ''
      }]
    })
  }

  async run (message, { username }) {
    if (!discordService.hasSomeRole(message.member, message.guild.getData('roleGroups').admin)) {
      if (!username) {
        username = message.member.displayName
      } else {
        return message.reply('You do not have permission to use the `suspensions` command.')
      }
    }

    if (username) {
      username = typeof username === 'string' ? username : username.displayName
      const userId = await userService.getIdFromUsername(username)
      const suspension = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/suspensions/${userId}`))
        .data
      const days = suspension.duration / 86400000
      const date = new Date(suspension.date)
      let extensionDays = 0
      if (suspension.extensions) {
        for (const extension of suspension.extensions) {
          extensionDays += extension.duration / 86400000
        }
      }
      const extensionString = extensionDays < 0
        ? ` (${extensionDays})`
        : extensionDays > 0
          ? ` (+${extensionDays})`
          : ''

      const embed = new MessageEmbed()
        .setTitle(`${message.argString ? `${username}'s` : 'Your'} suspension`)
        .addField('Start date', timeHelper.getDate(date), true)
        .addField('Start time', timeHelper.getTime(date), true)
        .addField('Duration', `${days}${extensionString} ${pluralize('day', days + extensionDays)}`,
          true)
        .addField('Rank back', suspension.rankBack ? 'yes' : 'no', true)
        .addField('Reason', suspension.reason)
        .setColor(message.guild.getData('primaryColor'))
      return message.replyEmbed(embed)
    } else {
      const suspensions = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/suspensions?sort=date`))
        .data
      if (suspensions.length === 0) {
        return message.reply('There are currently no suspensions.')
      }

      const embeds = await groupService.getSuspensionEmbeds(suspensions)
      for (const embed of embeds) {
        await message.author.send(embed)
      }
      return message.reply('Sent you a DM with the current suspensions.')
    }
  }
}

module.exports = SuspensionsCommand

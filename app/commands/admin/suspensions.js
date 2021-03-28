'use strict'

const pluralize = require('pluralize')
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { applicationAdapter } = require('../../adapters')
const { groupService, userService } = require('../../services')
const { getDate, getTime } = require('../../util').timeUtil

class SuspensionsCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'suspensions',
      aliases: ['suspensionlist', 'suspensioninfo'],
      description: 'Lists info of current suspensions/given user\'s suspension.',
      clientPermissions: ['SEND_MESSAGES'],
      requiresRobloxGroup: true,
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Of whose suspension would you like to know the information?',
        default: ''
      }]
    })
  }

  async run (message, { username }) {
    if (username) {
      username = typeof username === 'string' ? username : username.displayName
      const userId = await userService.getIdFromUsername(username)
      const suspension = (await applicationAdapter('get', `/v1/groups/${message.guild.groupId}/suspensions/${userId}`))
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
        .addField('Start date', getDate(date), true)
        .addField('Start time', getTime(date), true)
        .addField('Duration', `${days}${extensionString} ${pluralize('day', days + extensionDays)}`, true)
        .addField('Rank back', suspension.rankBack ? 'yes' : 'no', true)
        .addField('Reason', suspension.reason)
        .setColor(message.guild.primaryColor)
      return message.replyEmbed(embed)
    } else {
      const suspensions = (await applicationAdapter('get', `/v1/groups/${message.guild.robloxGroupId}/suspensions?sort=date`))
        .data
      if (suspensions.length === 0) {
        return message.reply('There are currently no suspensions.')
      }

      const embeds = await groupService.getSuspensionEmbeds(message.guild.robloxGroupId, suspensions)
      for (const embed of embeds) {
        await message.author.send(embed)
      }
      return message.reply('Sent you a DM with the current suspensions.')
    }
  }
}

module.exports = SuspensionsCommand

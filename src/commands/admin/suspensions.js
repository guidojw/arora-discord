'use strict'

const pluralize = require('pluralize')
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { applicationAdapter } = require('../../adapters')
const { groupService } = require('../../services')
const { getDate, getTime } = require('../../util').timeUtil

class SuspensionsCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'suspensions',
      aliases: ['suspensionlist', 'suspensioninfo'],
      description: 'Lists info of current suspensions/given user\'s suspension.',
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Of whose suspension would you like to know the information?',
        default: ''
      }]
    })
  }

  async run (message, { user }) {
    if (user) {
      const suspension = (await applicationAdapter('GET', `v1/groups/${message.guild.groupId}/suspensions/${user.id}`))
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
        .setTitle(`${user.username ?? user.id}'s suspension`)
        .addField('Start date', getDate(date), true)
        .addField('Start time', getTime(date), true)
        .addField('Duration', `${days}${extensionString} ${pluralize('day', days + extensionDays)}`, true)
        .addField('Rank back', suspension.rankBack ? 'yes' : 'no', true)
        .addField('Reason', suspension.reason)
        .setColor(message.guild.primaryColor)
      return message.replyEmbed(embed)
    } else {
      const suspensions = (await applicationAdapter('GET', `v1/groups/${message.guild.robloxGroupId}/suspensions?sort=date`))
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

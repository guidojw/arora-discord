'use strict'

const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { applicationAdapter } = require('../../adapters')
const { banService } = require('../../services')
const { getDate, getTime } = require('../../util').timeUtil

class BansCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'bans',
      aliases: ['banlist', 'baninfo'],
      description: 'Lists info of current bans/given user\'s ban.',
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Of whose ban would you like to know the information?',
        default: ''
      }]
    })
  }

  async run (message, { user }) {
    if (user) {
      const ban = (await applicationAdapter('get', `/v1/groups/${message.guild.robloxGroupId}/bans/${user.id}`)).data

      const embed = new MessageEmbed()
        .setTitle(`${user.username ?? user.id}'s ban`)
        .setColor(message.guild.primaryColor)
      if (ban.date) {
        const date = new Date(ban.date)
        embed.addField('Start date', getDate(date), true)
        embed.addField('Start time', getTime(date), true)
      }
      if (ban.reason) {
        embed.addField('Reason', ban.reason)
      }

      return message.replyEmbed(embed)
    } else {
      const bans = (await applicationAdapter('get', `/v1/groups/${message.guild.robloxGroupId}/bans?sort=date`)).data
      if (bans.length === 0) {
        return message.reply('There are currently no bans.')
      }

      const embeds = await banService.getBanEmbeds(message.guild.robloxGroupId, bans)
      for (const embed of embeds) {
        await message.author.send(embed)
      }

      return message.reply('Sent you a DM with the banlist.')
    }
  }
}

module.exports = BansCommand

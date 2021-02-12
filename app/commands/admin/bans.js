'use strict'
const applicationAdapter = require('../../adapters/application')
const BaseCommand = require('../base')
const timeHelper = require('../../helpers/time')

const { MessageEmbed } = require('discord.js')
const { banService, userService } = require('../../services')

class BansCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'bans',
      aliases: ['banlist', 'baninfo'],
      description: 'Lists info of current bans/given user\'s ban.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Of whose ban would you like to know the information?',
        default: ''
      }]
    })
  }

  async run (message, { username }) {
    if (message.guild.robloxGroupId === null) {
      return message.reply('This server is not bound to a Roblox group yet.')
    }
    if (username) {
      username = typeof username === 'string' ? username : username.displayName
      const userId = await userService.getIdFromUsername(username)
      const ban = (await applicationAdapter('get', `/v1/bans/${userId}`)).data

      const embed = new MessageEmbed()
        .setTitle(`${message.argString ? `${username}'s` : 'Your'} ban`)
        .setColor(message.guild.primaryColor)
      if (ban.date) {
        const date = new Date(ban.date)
        embed.addField('Start date', timeHelper.getDate(date), true)
        embed.addField('Start time', timeHelper.getTime(date), true)
      }
      if (ban.reason) {
        embed.addField('Reason', ban.reason)
      }

      return message.replyEmbed(embed)
    } else {
      const bans = (await applicationAdapter('get', '/v1/bans?sort=date')).data
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

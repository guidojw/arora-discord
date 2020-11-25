'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const banService = require('../../services/ban')
const userService = require('../../services/user')
const timeHelper = require('../../helpers/time')

const { MessageEmbed } = require('discord.js')

module.exports = class BansCommand extends Command {
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

  async execute (message, { username }, guild) {
    if (username) {
      username = typeof username === 'string' ? username : username.displayName
      const userId = await userService.getIdFromUsername(username)
      const ban = (await applicationAdapter('get', `/v1/bans/${userId}`)).data

      const embed = new MessageEmbed()
        .setTitle(`${message.argString ? `${username}'s` : 'Your'} ban`)
        .setColor(guild.getData('primaryColor'))
      if (ban.date) {
        const date = new Date(ban.date)
        embed.addField('Start date', timeHelper.getDate(date), true)
        embed.addField('Start time', timeHelper.getTime(date), true)
      }
      if (ban.reason) {
        embed.addField('Reason', ban.reason)
      }

      message.replyEmbed(embed)
    } else {
      const bans = (await applicationAdapter('get', '/v1/bans?sort=date')).data
      if (bans.length === 0) {
        return message.reply('There are currently no bans.')
      }

      const embeds = await banService.getBanEmbeds(bans)
      for (const embed of embeds) {
        await message.author.send(embed)
      }

      message.reply('Sent you a DM with the banlist.')
    }
  }
}

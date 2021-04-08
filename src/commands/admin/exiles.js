'use strict'

const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { applicationAdapter } = require('../../adapters')
const { groupService } = require('../../services')
const { getDate, getTime } = require('../../util').timeUtil

class ExilesCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'exiles',
      aliases: ['exilelist', 'exileinfo'],
      description: 'Lists info of current exiles/given user\'s exile.',
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Of whose exile would you like to know the information?',
        default: ''
      }]
    })
  }

  async run (message, { user }) {
    if (user) {
      const exile = (await applicationAdapter('GET', `v1/groups/${message.guild.robloxGroupId}/exiles/${user.id}`)).data

      const embed = new MessageEmbed()
        .setTitle(`${user.username ?? user.id}'s exile`)
        .setColor(message.guild.primaryColor)
      if (exile.date) {
        const date = new Date(exile.date)
        embed.addField('Start date', getDate(date), true)
        embed.addField('Start time', getTime(date), true)
      }
      if (exile.reason) {
        embed.addField('Reason', exile.reason)
      }

      return message.replyEmbed(embed)
    } else {
      const exiles = (await applicationAdapter('GET', `v1/groups/${message.guild.robloxGroupId}/exiles?sort=date`)).data
      if (exiles.length === 0) {
        return message.reply('There are currently no exiles.')
      }

      const embeds = await groupService.getExileEmbeds(exiles)
      for (const embed of embeds) {
        await message.author.send(embed)
      }

      return message.reply('Sent you a DM with the current exiles.')
    }
  }
}

module.exports = ExilesCommand

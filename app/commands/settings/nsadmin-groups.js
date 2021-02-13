'use strict'
const BaseCommand = require('../base')

const { stripIndents } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { discordService } = require('../../services')

class PanelsCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'nsadmingroups',
      description: 'Lists all role and channel groups.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'groupId',
        prompt: 'What group ID would you like to know the information of?',
        type: 'integer',
        default: ''
      }]
    })
  }

  async run (message, { groupId }) {
    if (groupId) {
      const group = message.guild.groups.cache.find(group => group.id === groupId )
      if (!group) {
        return message.reply('Group not found.')
      }

      const embed = new MessageEmbed()
        .addField(`Group ${group.id}`,
          stripIndents`
          Name: \`${group.name}\`
          Type: \`${group.type}\`
          Guarded: \`${group.guarded}\`
          `)
        .setColor(message.guild.primaryColor)
      return message.replyEmbed(embed)
    } else {
      if (message.guild.groups.cache.length === 0) {
        return message.reply('No groups found.')
      }

      const embeds = await discordService.getListEmbeds(
        'Groups',
        [...message.guild.groups.cache.values()],
        getGroupRow
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
    }
  }
}

function getGroupRow ([, group]) {
  return `${group.id}. **${group.name}**`
}

module.exports = PanelsCommand

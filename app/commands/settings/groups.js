'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { discordService } = require('../../services')

class GroupsCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'groups',
      description: 'Lists all role and channel groups.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'group',
        prompt: 'What group would you like to know the information of?',
        type: 'nsadmin-group',
        default: ''
      }]
    })
  }

  async run (message, { group }) {
    if (group) {
      const embed = new MessageEmbed()
        .setTitle(`Group ${group.id}`)
        .addField('Name', group.name, true)
        .addField('Type', group.type, true)
        .addField('Guarded', group.guarded ? 'yes' : 'no', true)
        .setColor(message.guild.primaryColor)
      if (group.type === 'channel') {
        embed.addField('Channels', Array.from(group.channels.cache.values()).join(' ') || 'none')
      } else {
        embed.addField('Roles', Array.from(group.roles.cache.values()).join(' ') || 'none')
      }
      return message.replyEmbed(embed)
    } else {
      if (message.guild.groups.cache.size === 0) {
        return message.reply('No groups found.')
      }

      const embeds = discordService.getListEmbeds(
        'Groups',
        message.guild.groups.cache,
        getGroupRow
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
    }
  }
}

function getGroupRow ([, group]) {
  return `${group.id}. \`${group.name}\``
}

module.exports = GroupsCommand

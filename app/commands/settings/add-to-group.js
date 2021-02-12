'use strict'
const BaseCommand = require('../base')

const { Channel: DiscordChannel } = require('discord.js')
const { ChannelGroup } = require('../../structures')

class AddToGroupCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'addtogroup',
      description: 'Adds a channel|role to a group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'groupId',
        prompt: 'To what group do you want to add a channel|role?',
        type: 'integer'
      }, {
        key: 'channelOrRole',
        prompt: 'What channel|role do you want to add to this group?',
        type: 'channel|role'
      }]
    })
  }

  async run (message, { groupId, channelOrRole }) {
    const group = message.guild.groups.cache.find(group => group.id === groupId)
    if (!group) {
      return message.reply('Group not found.')
    }

    if (channelOrRole instanceof DiscordChannel) {
      if (!(group instanceof ChannelGroup)) {
        return message.reply('Group can only contain channels.')
      } else if (group.channels.cache.some(channel => channel.id === channelOrRole.id)) {
        return message.reply(`Group already contains channel **${channelOrRole.id}**.`)
      }

      await group.channels.add(channelOrRole)
    } else {
      if (group instanceof ChannelGroup) {
        return message.reply('Group can only contain roles.')
      } else if (group.roles.cache.some(role => role.id === channelOrRole.id)) {
        return message.reply(`Group already contains role **${channelOrRole.id}**.`)
      }

      await group.roles.add(channelOrRole)
    }

    return message.reply(`Successfully added role **${channelOrRole.id}** to group **${group.id}**.`)
  }
}

module.exports = AddToGroupCommand

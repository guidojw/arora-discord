'use strict'
const applicationAdapter = require('../../adapters/application')
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

class MemberCountCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'miscellaneous',
      name: 'membercount',
      description: 'Posts the current member count of the group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'groupId',
          type: 'integer',
          prompt: 'From what group would you like to know the member count?',
          default: applicationConfig.groupId
        }
      ]
    })
  }

  async run (message, { groupId }) {
    const group = (await applicationAdapter('get', `/v1/groups/${groupId}`)).data

    const embed = new MessageEmbed()
      .addField(`${group.name}'s member count`, group.memberCount)
      .setColor(message.guild.getData('primaryColor'))
    return message.replyEmbed(embed)
  }
}

module.exports = MemberCountCommand

'use strict'

const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')

class PersistentRolesCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'persistentroles',
      description: 'Fetches given member\'s persistent roles.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'member',
        type: 'member',
        prompt: 'Of who would you like to know the persistent roles?',
        default: message => message.member
      }]
    })
  }

  async run (message, { member }) {
    const persistentRoles = await member.fetchPersistentRoles()
    if (persistentRoles.size === 0) {
      return message.reply('No persistent roles found.')
    }

    const embed = new MessageEmbed()
      .setTitle(`${member.user.tag}'s Persistent Roles`)
      .setDescription(persistentRoles.map(role => role.toString()))
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = PersistentRolesCommand

'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { discordService } = require('../../services')

class RoleBindingsCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'tickettypes',
      description: 'Lists all ticket types.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'type',
        prompt: 'What ticket type would you like to know the information of?',
        type: 'ticket-type',
        default: ''
      }]
    })
  }

  async run (message, { type }) {
    if (type) {
      const embed = new MessageEmbed()
        .addField(`Ticket Type ${type.id}`, `Name: \`${type.name}\``)
        .setColor(message.guild.primaryColor)
      return message.replyEmbed(embed)
    } else {
      if (message.guild.ticketTypes.cache.size === 0) {
        return message.reply('No ticket types found.')
      }

      const embeds = discordService.getListEmbeds(
        'Ticket Types',
        message.guild.ticketTypes.cache,
        getTicketTypeRow
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
    }
  }
}

function getTicketTypeRow ([, type]) {
  return `${type.id}. \`${type.name}\``
}

module.exports = RoleBindingsCommand

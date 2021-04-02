'use strict'

const lodash = require('lodash')
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { discordService } = require('../../services')

class RoleMessagesCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'rolemessages',
      aliases: ['rolemsgs', 'rolemessage', 'rolemsg'],
      description: 'Lists all role messages.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'roleMessage',
        prompt: 'What role message would you like to know the information of?',
        type: 'integer',
        default: ''
      }]
    })
  }

  async run (message, { roleMessage }) {
    if (roleMessage) {
      roleMessage = message.guild.roleMessages.resolve(roleMessage)
      if (!roleMessage) {
        return message.reply('Role message not found.')
      }

      const embed = new MessageEmbed()
        .addField(`Role Message ${roleMessage.id}`, `Message ID: \`${roleMessage.messageId}\`, ${roleMessage.emoji} => ${roleMessage.role}`)
        .setColor(message.guild.primaryColor)
      return message.replyEmbed(embed)
    } else {
      if (message.guild.roleMessages.cache.size === 0) {
        return message.reply('No role messages found.')
      }

      const embeds = discordService.getListEmbeds(
        'Role Messages',
        lodash.groupBy(Array.from(message.guild.roleMessages.cache.values()), 'messageId'),
        getGroupedRoleMessageRow
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
    }
  }
}

function getGroupedRoleMessageRow ([id, roleMessages]) {
  let result = `**${id}**\n`
  for (const roleMessage of roleMessages) {
    result += `${roleMessage.id}. ${roleMessage.emoji} => ${roleMessage.role}\n`
  }
  return result
}

module.exports = RoleMessagesCommand

'use strict'
const BaseCommand = require('../base')
const lodash = require('lodash')

const { MessageEmbed } = require('discord.js')
const { RoleMessage } = require('../../models')
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
        key: 'roleMessageId',
        prompt: 'What role message would you like to know the information of?',
        type: 'integer',
        default: ''
      }]
    })
  }

  async run (message, { roleMessageId }) {
    if (roleMessageId) {
      const roleMessage = await RoleMessage.findByPk(roleMessageId)
      if (!roleMessage) {
        return message.reply('Role message not found.')
      }
      const emoji = message.guild.emojis.cache.get(roleMessage.emojiId) || roleMessage.emojiId
      const role = message.guild.roles.cache.get(roleMessage.roleId) || 'Unknown'

      const embed = new MessageEmbed()
        .addField(`Role Message ${roleMessage.id}`, `Message ID: **${roleMessage.messageId}**, ${emoji} => **${role}**`)
        .setColor(message.guild.primaryColor)
      return message.replyEmbed(embed)
    } else {
      const roleMessages = await RoleMessage.findAll({ where: { guildId: message.guild.id } })
      if (roleMessages.length === 0) {
        return message.reply('No role messages found.')
      }

      const embeds = await discordService.getListEmbeds(
        'Role Messages',
        lodash.groupBy(roleMessages, 'messageId'),
        getGroupedRoleMessageRow,
        { emojis: message.guild.emojis, roles: message.guild.roles }
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
    }
  }
}

function getGroupedRoleMessageRow ([id, roleMessages], { emojis, roles }) {
  let result = `**${id}**\n`
  for (const roleMessage of roleMessages) {
    const emoji = roleMessage.emoji ?? emojis.cache.get(roleMessage.emojiId)
    const role = roles.cache.get(roleMessage.roleId) || 'Unknown'
    result += `${roleMessage.id}. ${emoji} => **${role}**`
  }
  return result
}

module.exports = RoleMessagesCommand

'use strict'
const Command = require('../../controllers/command')
const lodash = require('lodash')
const discordService = require('../../services/discord')

const { MessageEmbed } = require('discord.js')
const { RoleMessage } = require('../../models')

class RoleMessagesCommand extends Command {
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

  async execute (message, { roleMessageId }, guild) {
    if (roleMessageId) {
      const roleMessage = await RoleMessage.findByPk(roleMessageId)
      if (!roleMessage) {
        return message.reply('Role message not found.')
      }
      const emoji = guild.guild.emojis.cache.get(roleMessage.emojiId) || roleMessage.emojiId
      const role = guild.guild.roles.cache.get(roleMessage.roleId) || 'Unknown'

      const embed = new MessageEmbed()
        .addField(`Role Message ${roleMessage.id}`, `Message ID: **${roleMessage.messageId}**, ${emoji} => **${role}**`)
        .setColor(guild.primaryColor)
      return message.replyEmbed(embed, undefined, { allowedMentions: { users: [message.author.id] } })
    } else {
      const roleMessages = await RoleMessage.findAll({ where: { guildId: guild.id } })
      if (roleMessages.length === 0) {
        return message.reply('No role messages found.')
      }

      const embeds = await discordService.getListEmbeds(
        'Role Messages',
        lodash.groupBy(roleMessages, 'messageId'),
        _getGroupedRoleMessageRow,
        { emojis: guild.guild.emojis, roles: guild.guild.roles }
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed, undefined, { allowedMentions: { users: [message.author.id] } })
      }
    }
  }
}

function _getGroupedRoleMessageRow ([id, roleMessages], { emojis, roles }) {
  let result = `**${id}**\n`
  for (const roleMessage of roleMessages) {
    const emoji = emojis.cache.get(roleMessage.emojiId) || roleMessage.emojiId
    const role = roles.cache.get(roleMessage.roleId) || 'Unknown'
    result += `${roleMessage.id}. ${emoji} => **${role}**`
  }
  return result
}

module.exports = RoleMessagesCommand

'use strict'
const Command = require('../../controllers/command')
const lodash = require('lodash')
const discordService = require('../../services/discord')

const { MessageEmbed } = require('discord.js')
const { RoleBinding } = require('../../models')

class RoleBindingsCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'rolebindings',
      aliases: ['rolebnds', 'rolebinding', 'rolebnd'],
      description: 'Lists all Roblox rank to Discord role bindings.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'roleBindingId',
        prompt: 'What role binding would you like to know the information of?',
        type: 'integer',
        default: ''
      }]
    })
  }

  async execute (message, { roleBindingId }, guild) {
    if (roleBindingId) {
      const roleBinding = await RoleBinding.findByPk(roleBindingId)
      if (!roleBinding) {
        return message.reply('Role binding not found.')
      }
      const role = guild.guild.roles.cache.get(roleBinding.roleId) || 'Unknown'

      const embed = new MessageEmbed()
        .addField(`Role Binding ${roleBinding.id}`, `${_getRangeString(roleBinding.min, roleBinding.max)} => **${role}**`)
        .setColor(guild.primaryColor)
      return message.replyEmbed(embed, undefined, { allowedMentions: { users: [message.author.id] } })
    } else {
      const roleBindings = await RoleBinding.findAll({ where: { guildId: guild.id } })
      if (roleBindings.length === 0) {
        return message.reply('No role bindings found.')
      }

      const embeds = await discordService.getListEmbeds(
        'Role Bindings',
        lodash.groupBy(roleBindings, 'roleId'),
        _getGroupedRoleBindingRow,
        { roles: guild.guild.roles }
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed, undefined, { allowedMentions: { users: [message.author.id] } })
      }
    }
  }
}

function _getGroupedRoleBindingRow (groupedRoleBinding, { roles }) {
  let result = ''
  const role = roles.cache.get(groupedRoleBinding.shift()) || 'Unknown'
  result += `**${role}**\n`
  for (const roleBinding of groupedRoleBinding.pop()) {
    result += `**${roleBinding.id}**. ${_getRangeString(roleBinding.min, roleBinding.max)}\n`
  }
  return result
}

function _getRangeString (min, max) {
  return `${max ? '[' : ''}**${min}**${max ? `, **${max}**]` : ''}`
}

module.exports = RoleBindingsCommand

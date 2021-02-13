'use strict'
const BaseCommand = require('../base')
const lodash = require('lodash')

const { MessageEmbed } = require('discord.js')
const { RoleBinding } = require('../../models')
const { discordService } = require('../../services')

class RoleBindingsCommand extends BaseCommand {
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

  async run (message, { roleBindingId }) {
    if (roleBindingId) {
      const roleBinding = await RoleBinding.findOne({ where: { id: roleBindingId, guildId: message.guild.id } })
      if (!roleBinding) {
        return message.reply('Role binding not found.')
      }
      const role = message.guild.roles.cache.get(roleBinding.roleId) || 'Unknown'

      const embed = new MessageEmbed()
        .addField(`Role Binding ${roleBinding.id}`, `${getRangeString(roleBinding.min, roleBinding.max)} => **${role}**`)
        .setColor(message.guild.primaryColor)
      return message.replyEmbed(embed)
    } else {
      const roleBindings = await RoleBinding.findAll({ where: { guildId: message.guild.id } })
      if (roleBindings.length === 0) {
        return message.reply('No role bindings found.')
      }

      const embeds = discordService.getListEmbeds(
        'Role Bindings',
        lodash.groupBy(roleBindings, 'roleId'),
        getGroupedRoleBindingRow,
        { roles: message.guild.roles }
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
    }
  }
}

function getGroupedRoleBindingRow ([id, roleBindings], { roles }) {
  let result = ''
  const role = roles.cache.get(id) || 'Unknown'
  result += `**${role}**\n`
  for (const roleBinding of roleBindings) {
    result += `${roleBinding.id}. ${getRangeString(roleBinding.min, roleBinding.max)}\n`
  }
  return result
}

function getRangeString (min, max) {
  return `${max ? '[' : ''}**${min}**${max ? `, **${max}**]` : ''}`
}

module.exports = RoleBindingsCommand

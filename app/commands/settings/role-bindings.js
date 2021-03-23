'use strict'
const BaseCommand = require('../base')
const lodash = require('lodash')

const { MessageEmbed } = require('discord.js')
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
        key: 'roleBinding',
        prompt: 'What role binding would you like to know the information of?',
        type: 'integer',
        default: ''
      }]
    })
  }

  async run (message, { roleBinding }) {
    if (roleBinding) {
      roleBinding = message.guild.roleBindings.resolve(roleBinding)
      if (!roleBinding) {
        return message.reply('Role binding not found.')
      }

      const embed = new MessageEmbed()
        .addField(`Role Binding ${roleBinding.id}`, `\`${roleBinding.robloxGroupId}\` \`${getRangeString(roleBinding.min, roleBinding.max)}\` => ${roleBinding.role}`)
        .setColor(message.guild.primaryColor)
      return message.replyEmbed(embed)
    } else {
      if (message.guild.roleBindings.cache.size === 0) {
        return message.reply('No role bindings found.')
      }

      const embeds = discordService.getListEmbeds(
        'Role Bindings',
        lodash.groupBy(Array.from(message.guild.roleBindings.cache.values()), 'roleId'),
        getGroupedRoleBindingRow
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
    }
  }
}

function getGroupedRoleBindingRow ([, roleBindings]) {
  let result = ''
  const role = roleBindings[0].role
  result += `${role}\n`
  for (const roleBinding of roleBindings) {
    result += `${roleBinding.id}. \`${roleBinding.robloxGroupId}\` \`${getRangeString(roleBinding.min, roleBinding.max)}\`\n`
  }
  return result
}

function getRangeString (min, max) {
  return `${max ? '[' : ''}${min}${max ? `, ${max}]` : ''}`
}

module.exports = RoleBindingsCommand

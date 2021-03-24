'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { NSadminGuildMember: GuildMember } = require('../../extensions')

class PermissionsCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'permissions',
      description: 'Lists a member\'s, role\'s or group\'s command permissions.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'memberOrRoleOrGroup',
        label: 'member/role/group',
        prompt: 'Of what member, role or group would you like to know the command permissions?',
        type: 'member|role-group|role'
      }]
    })
  }

  async run (message, { memberOrRoleOrGroup }) {
    const embed = new MessageEmbed()
      .setColor(message.guild.primaryColor)
    if (memberOrRoleOrGroup instanceof GuildMember) {
      embed
        .setTitle(`${memberOrRoleOrGroup.user.tag}'s Permissions`)
        .setThumbnail(memberOrRoleOrGroup.user.displayAvatarURL())
    } else {
      embed
        .setTitle(`${memberOrRoleOrGroup.name}'s Permissions`)
        .addField('Note', 'If a command group has a permission with allow: true (e.g. "**Settings: true' +
          '**", all commands in it without a permission (e.g. "createtag: `null`") will implicitly also have a ' +
          'permission with allow: true.')
    }

    const fn = memberOrRoleOrGroup instanceof GuildMember
      ? memberOrRoleOrGroup.canRunCommand.bind(memberOrRoleOrGroup)
      : command => memberOrRoleOrGroup.permissionFor(command, true)
    const groups = this.client.registry.groups
      .filter(group => !group.guarded && group.id !== 'util' && group.isEnabledIn(message.guild))
      .sort((groupA, groupB) => groupB.commands.size - groupA.commands.size)
    for (const group of groups.values()) {
      const commands = group.commands.filter(command => !command.guarded && command.isEnabledIn(message.guild))
      const commandsPermissions = getCommandsPermissions(commands, fn)
      if (commandsPermissions !== '') {
        embed.addField(`${group.name}: ${fn(group)}`, commandsPermissions, true)
      }
    }

    return message.replyEmbed(embed)
  }
}

function getCommandsPermissions (commands, fn) {
  let field = ''
  for (const command of commands.values()) {
    field += `${command.name}: \`${fn(command)}\`\n`
  }
  return field
}

module.exports = PermissionsCommand

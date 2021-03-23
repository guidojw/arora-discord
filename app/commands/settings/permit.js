'use strict'
const BaseCommand = require('../base')

const { NSadminRole } = require('../../extensions')
const { GroupTypes } = require('../../util/constants')

class PermitCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'permit',
      description: 'Grants a role or group permission to use or explicitly not use a command or command group. Can ' +
        'also be used to delete a permission.',
      details: 'If a member is in at least one role or group that has a permission for a command or command group ' +
        'that explicitly allows them to **not** use it, they won\'t be able to run that command or commands in that ' +
        'group.',
      examples: [
        'permit @Admin Settings true', 'permit @Admin Settings false', 'permit @Admin Settings none',
        'permit @Admin createtag true', 'permit @Admin createtag false', 'permit @Admin createtag none',
        'permit adminGroup Settings true', 'permit adminGroup Settings false', 'permit adminGroup Settings none',
        'permit adminGroup createtag true', 'permit adminGroup createtag false', 'permit adminGroup createtag none'
      ],
      clientPermissions: ['SEND_MESSAGES'],
      userPermissions: ['ADMINISTRATOR'],
      guarded: true,
      args: [{
        key: 'roleOrGroup',
        label: 'role/group',
        prompt: 'For what role or group do you want to create, edit or delete a permission?',
        type: 'role|integer|string'
      }, {
        key: 'commandOrGroup',
        label: 'command/group',
        prompt: 'For what command or command group do you want to create, edit or delete a permission?',
        type: 'command|group'
      }, {
        key: 'allow',
        prompt: 'What do you want the allow value of this permission to be? Reply with "none" if you want to delete' +
          ' the permission.',
        type: 'boolean',
        validate: validateAllow,
        parse: parseAllow
      }]
    })
  }

  async run (message, { roleOrGroup, commandOrGroup, allow }) {
    roleOrGroup = roleOrGroup instanceof NSadminRole ? roleOrGroup : message.guild.groups.resolve(roleOrGroup)
    if (!roleOrGroup) {
      return message.reply('Group not found.')
    }
    if (!(roleOrGroup instanceof NSadminRole || roleOrGroup.type === GroupTypes.ROLE)) {
      return message.reply('Invalid group.')
    }
    const commandType = commandOrGroup.group ? 'command' : 'group'
    const permissibleType = roleOrGroup instanceof NSadminRole ? 'role' : 'group'
    const subject = `${permissibleType} ${permissibleType === 'role' ? roleOrGroup  : `\`${roleOrGroup}\``}`

    if (typeof allow === 'undefined') {
      await roleOrGroup.nsadminPermissions.delete(commandOrGroup)
      return message.reply(`Successfully deleted \`${commandOrGroup.name}\` ${commandType} permission from ${subject}.`, {
        allowedMentions: { users: [message.author.id] }
      })
    } else {
      const permission = roleOrGroup.nsadminPermissions.resolve(commandOrGroup)
      if (permission) {
        await permission.update({ allow })
        return message.reply(`Successfully changed \`${commandOrGroup.name}\` ${commandType} permission for ${subject} to allow: \`${allow}\`.`, {
          allowedMentions: { users: [message.author.id] }
        })
      } else {
        await roleOrGroup.nsadminPermissions.create(commandOrGroup, allow)
        return message.reply(`Successfully created \`${commandOrGroup.name}\` ${commandType} permission for ${subject} with allow: \`${allow}\`.`, {
          allowedMentions: { users: [message.author.id] }
        })
      }
    }
  }
}

function validateAllow (val, msg) {
  return val === 'none' || this.type.validate(val, msg, this)
}

function parseAllow (val, msg) {
  return val === 'none' ? undefined : this.type.parse(val, msg, this)
}

module.exports = PermitCommand

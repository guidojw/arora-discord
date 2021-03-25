'use strict'
const BaseCommand = require('../base')

const { validateNoneOrType, parseNoneOrType } = require('../../util').argumentUtil

class CreateRoleBindingCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'createrolebinding',
      aliases: ['createrolebnd'],
      description: 'Creates a new Roblox rank to Discord role binding.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'role',
        prompt: 'To what role would you like to bind this binding?',
        type: 'role'
      }, {
        key: 'min',
        prompt: 'What do you want the lower limit of this binding to be?',
        type: 'integer',
        min: 0,
        max: 255
      }, {
        key: 'max',
        prompt: 'What do you want the upper limit of this binding to be? Reply with "none" if you don\'t want one.',
        type: 'integer',
        min: 0,
        max: 255,
        validate: validateNoneOrType,
        parse: parseNoneOrType
      }]
    })
  }

  async run (message, { role, min, max }) {
    const roleBinding = await message.guild.roleBindings.create({ role, min, max })

    return message.reply(`Successfully bound group \`${roleBinding.robloxGroupId}\` rank \`${getRangeString(roleBinding.min, roleBinding.max)}\` to role ${roleBinding.role}.`, {
      allowedMentions: { users: [message.author.id] }
    })
  }
}

function getRangeString (min, max) {
  return `${max ? '[' : ''}${min}${max ? `, ${max}]` : ''}`
}

module.exports = CreateRoleBindingCommand

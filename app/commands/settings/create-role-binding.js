'use strict'
const BaseCommand = require('../base')

const { Role, RoleBinding } = require('../../models')

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
        validate: validateRank
      }, {
        key: 'max',
        prompt: 'What do you want the upper limit of this binding to be? Reply with "0" if you don\'t want one.',
        type: 'integer',
        validate: validateRank
      }]
    })
  }

  async run (message, { role, min, max }) {
    if (message.guild.robloxGroupId === null) {
      return message.reply('This server is not bound to a Roblox group yet.')
    }
    max = max === 0 ? undefined : max
    if (typeof max !== 'undefined' && max < min) {
      [min, max] = [max, min]
    }

    await Role.findOrCreate({
      where: {
        id: role.id,
        guildId: message.guild.id
      }
    })
    const [, created] = await RoleBinding.findOrCreate({
      where: {
        robloxGroupId: message.guild.robloxGroupId,
        guildId: message.guild.id,
        roleId: role.id,
        min,
        max: max ?? null
      }
    })
    if (!created) {
      return message.reply('A role message with that message and range already exists.')
    }

    return message.reply('Successfully created role binding.')
  }
}

function validateRank (value) {
  return (value >= 0 && value <= 255) || 'Invalid rank.'
}

module.exports = CreateRoleBindingCommand

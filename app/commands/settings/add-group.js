'use strict'
const BaseCommand = require('../base')
const { Group } = require('../../models')

class AddGroupCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'addgroup',
      description: 'Adds a new group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        prompt: 'What do you want the name of the group to be?',
        type: 'string',
        validate: _validateName
      }, {
        key: 'type',
        prompt: 'What do you want the type of the group to be?',
        type: 'string',
        oneOf: ['role', 'channel']
      }]
    })
  }

  async run (message, { name, type }) {
    type = type.toLowerCase()
    if (this.client.registry.commands.some(command => command.name === name || command.aliases?.includes(name))) {
      return message.reply('Not allowed, name is reserved.')
    }
    if (await Group.findOne({
      where: { name, guildId: message.guild.id }
    })) {
      return message.reply('A group with that name already exists.')
    }

    const group = await Group.create({ name, type, guildId: message.guild.id })
    message.guild.groups.set(group.id, group)

    return message.reply(`Successfully added group **${name}**.`)
  }
}

function _validateName (name) {
  return name.includes(' ') ? 'Name cannot include spaces.' : true
}

module.exports = AddGroupCommand

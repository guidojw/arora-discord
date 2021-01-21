'use strict'
const BaseCommand = require('../base')
const { Group } = require('../../models')

class CreateGroupCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'creategroup',
      description: 'Creates a new group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        prompt: 'What do you want the name of the group to be?',
        type: 'string',
        validate: validateName
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
    const [group, created] = await Group.findOrCreate({
      where: {
        guildId: message.guild.id,
        name
      },
      defaults: {
        type
      }
    })
    if (!created) {
      return message.reply('A group with that name already exists.')
    }

    message.guild.groups.set(group.id, group)

    return message.reply(`Successfully create group **${name}**.`)
  }
}

function validateName (name) {
  return name.includes(' ') ? 'Name cannot include spaces.' : true
}

module.exports = CreateGroupCommand

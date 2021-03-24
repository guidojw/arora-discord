'use strict'
const BaseCommand = require('../base')

const { validators, noNumber, noSpaces } = require('../../util').argumentUtil
const { GroupTypes } = require('../../util').Constants

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
        validate: validators([noNumber, noSpaces])
      }, {
        key: 'type',
        prompt: 'What do you want the type of the group to be?',
        type: 'string',
        oneOf: Object.values(GroupTypes)
      }]
    })
  }

  async run (message, { name, type }) {
    const group = await message.guild.groups.create(name, type)

    return message.reply(`Successfully created group \`${group.name}\`.`)
  }
}

module.exports = CreateGroupCommand

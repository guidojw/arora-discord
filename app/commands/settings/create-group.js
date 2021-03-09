'use strict'
const BaseCommand = require('../base')

const { GroupTypes } = require('../../util/constants')

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
        oneOf: Object.values(GroupTypes)
      }]
    })
  }

  async run (message, { name, type }) {
    const group = await message.guild.groups.create(name, type)

    return message.reply(`Successfully created group **${group.id}**.`)
  }
}

function validateName (val, msg) {
  const valid = this.type.validate(val, msg, this)
  if (!valid || typeof valid === 'string') {
    return valid
  }
  return !isNaN(parseInt(val))
    ? 'Name cannot be a number.'
    : val.includes(' ')
      ? 'Name cannot include spaces.'
      : true
}

module.exports = CreateGroupCommand

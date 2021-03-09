'use strict'
const BaseCommand = require('../base')

class CreateTagCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'createtag',
      description: 'Creates a new tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        prompt: 'What do you want the name of the tag to be?',
        type: 'string',
        validate: validateName
      }, {
        key: 'content',
        prompt: 'What do you want the content of the tag to be?',
        type: 'json-object|string',
        validate: validateContent
      }]
    })
  }

  async run (message, { name, content }) {
    const tag = await message.guild.tags.create(name, content)

    return message.reply(`Successfully created tag **${tag.names.cache.first()?.name ?? 'Unknown'}**.`)
  }
}

function validateName (val, msg) {
  const valid = this.type.validate(val, msg, this)
  if (!valid || typeof valid === 'string') {
    return valid
  }
  return !isNaN(parseInt(val))
    ? 'Name cannot be a number.'
    : true
}

async function validateContent (val, msg) {
  const valid = await this.type.validate(val, msg, this)
  if (!valid || typeof valid === 'string') {
    return valid
  }
  const parsed = await this.type.parse(val, msg, this)
  return typeof parsed === 'string' || Object.prototype.toString.call(parsed) === '[object Object]'
}

module.exports = CreateTagCommand

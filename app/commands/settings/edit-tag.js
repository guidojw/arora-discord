'use strict'
const BaseCommand = require('../base')

class EditTagCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'edittag',
      description: 'Edits a tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        prompt: 'What tag would you like to edit?',
        type: 'string'
      }, {
        key: 'content',
        prompt: 'What do you want the new content of this tag to be?',
        type: 'json-object|string',
        validate: validateContent
      }]
    })
  }

  async run (message, { name, content }) {
    const tag = await message.guild.tags.update(name, { content })

    return message.reply(`Successfully edited tag **${tag.names.cache.first()?.name ?? 'Unknown'}**.`)
  }
}

function validateContent (val, msg) {
  const valid = this.type.validate(val, msg, this)
  if (!valid || typeof valid === 'string') {
    return valid
  }
  const parsed = this.type.parse(val, msg, this)
  return typeof parsed === 'string' || Object.prototype.toString.call(parsed) === '[object Object]'
}

module.exports = EditTagCommand

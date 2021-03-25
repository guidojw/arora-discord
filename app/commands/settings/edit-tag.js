'use strict'
const BaseCommand = require('../base')

const { validators, isObject, typeOf } = require('../../util').argumentUtil

class EditTagCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'edittag',
      description: 'Edits a tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'tag',
        prompt: 'What tag would you like to edit?',
        type: 'tag'
      }, {
        key: 'content',
        prompt: 'What do you want the new content of this tag to be?',
        type: 'json-object|string',
        validate: validators([[isObject, typeOf('string')]])
      }]
    })
  }

  async run (message, { tag, content }) {
    tag = await message.guild.tags.update(tag, { content })

    return message.reply(`Successfully edited tag \`${tag.names.cache.first()?.name ?? 'Unknown'}\`.`)
  }
}

module.exports = EditTagCommand

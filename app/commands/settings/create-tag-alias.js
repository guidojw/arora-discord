'use strict'
const BaseCommand = require('../base')

class CreateTagAliasCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'createtagalias',
      aliases: ['createalias'],
      description: 'Creates a new alias for a tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'idOrName',
        prompt: 'To what tag would you like to add this alias?',
        type: 'integer|string'
      }, {
        key: 'alias',
        prompt: 'What would you like the new alias of this tag to be?',
        type: 'string',
        validate: validateAlias
      }]
    })
  }

  async run (message, { idOrName, alias }) {
    const tag = message.guild.tags.resolve(idOrName)
    if (!tag) {
      return message.reply('Tag not found')
    }

    const tagName = await tag.names.create(alias)

    return message.reply(`Successfully created alias **${tagName.name}** for tag **${tag.names.cache.first()?.name ?? 'Unknown'}**.`)
  }
}

function validateAlias (val, msg) {
  const valid = this.type.validate(val, msg, this)
  if (!valid || typeof valid === 'string') {
    return valid
  }
  return !isNaN(parseInt(val))
    ? 'Alias cannot be a number.'
    : true
}

module.exports = CreateTagAliasCommand

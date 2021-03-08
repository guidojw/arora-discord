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

    await tag.names.create(alias)

    return message.reply(`Successfully created alias **${alias}** for tag **${tag.names.cache.first()?.name ?? 'Unknown'}**.`)
  }
}

function validateAlias (name) {
  return name.includes(' ') ? 'Alias cannot include spaces.' : true
}

module.exports = CreateTagAliasCommand

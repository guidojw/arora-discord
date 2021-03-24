'use strict'
const BaseCommand = require('../base')

const { validators, noNumber } = require('../../util').argumentUtil

class CreateTagAliasCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'createtagalias',
      aliases: ['createalias'],
      description: 'Creates a new alias for a tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'tag',
        prompt: 'To what tag would you like to add this alias?',
        type: 'tag'
      }, {
        key: 'alias',
        prompt: 'What would you like the new alias of this tag to be?',
        type: 'string',
        validate: validators([noNumber])
      }]
    })
  }

  async run (message, { tag, alias }) {
    const tagName = await tag.names.create(alias)

    return message.reply(`Successfully created alias \`${tagName.name}\` for tag \`${tag.names.cache.first()?.name ?? 'Unknown'}\`.`)
  }
}

module.exports = CreateTagAliasCommand

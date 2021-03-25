'use strict'
const Base = require('../base')

class DeleteTagAliasCommand extends Base {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'deletetagalias',
      aliases: ['deltagalias', 'deletealias', 'delalias'],
      description: 'Deletes a tag alias.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'alias',
        prompt: 'What tag alias would you like to delete?',
        type: 'string'
      }]
    })
  }

  async run (message, { alias }) {
    const tag = message.guild.tags.resolve(alias)
    if (!tag) {
      return message.reply('Tag not found')
    }

    await tag.names.delete(alias)

    return message.reply(`Successfully deleted alias from tag \`${tag.names.cache.first()?.name ?? 'Unknown'}\`.`)
  }
}

module.exports = DeleteTagAliasCommand

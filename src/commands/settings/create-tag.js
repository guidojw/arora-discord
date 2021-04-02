'use strict'

const BaseCommand = require('../base')

const { validators, isObject, noNumber, typeOf } = require('../../util').argumentUtil

class CreateTagCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'createtag',
      description: 'Creates a new tag.',
      details: 'For the content argument, you can input either any message or a JSON format embed object. You can use' +
        ' the Embed Visualizer at <https://leovoel.github.io/embed-visualizer/> to create an embed. When finished, ' +
        'copy object (denoted with {}) on the left output screen after "embed: ".',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        prompt: 'What do you want the name of the tag to be?',
        type: 'string',
        validate: validators([noNumber])
      }, {
        key: 'content',
        prompt: 'What do you want the content of the tag to be?',
        type: 'json-object|string',
        validate: validators([[isObject, typeOf('string')]])
      }]
    })
  }

  async run (message, { name, content }) {
    const tag = await message.guild.tags.create(name, content)

    return message.reply(`Successfully created tag \`${tag.names.cache.first()?.name ?? 'Unknown'}\`.`)
  }
}

module.exports = CreateTagCommand

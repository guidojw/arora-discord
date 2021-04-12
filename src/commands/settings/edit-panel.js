'use strict'

const { Message } = require('discord.js')

const BaseCommand = require('../base')

class EditPanelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'editpanel',
      aliases: ['editpnl'],
      description: 'Edits a panel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'panel',
        prompt: 'What panel would you like to edit?',
        type: 'panel'
      }, {
        key: 'key',
        type: 'string',
        prompt: 'What key would you like to edit?',
        oneOf: ['content', 'message'],
        parse: val => val.toLowerCase()
      }, {
        key: 'data',
        prompt: 'What would you like to edit this key\'s data to?',
        type: 'json-object|message'
      }]
    })
  }

  async run (message, { panel, key, data }) {
    const changes = {}
    if (key === 'content') {
      if (data instanceof Message) {
        return message.reply('`data` must be an object.')
      }

      changes.content = data
    } else if (key === 'message') {
      if (!(data instanceof Message)) {
        return message.reply('`data` must be a message URL.')
      }

      changes.message = data
    }

    panel = await message.guild.panels.update(panel, changes)

    return message.reply(`Successfully edited panel \`${panel.name}\`.`)
  }
}

module.exports = EditPanelCommand

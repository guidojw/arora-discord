'use strict'
const Command = require('../../controllers/command')

const { Channel, CategoryChannel, Message } = require('discord.js')
const { Guild } = require('../../models')

module.exports = class SetSettingCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'setsetting',
      aliases: ['set'],
      description: 'Sets a guild\'s setting.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'key',
        prompt: 'What setting would you like to change?',
        type: 'string',
        oneOf: Object.keys(Guild.rawAttributes)
          .filter(attribute => attribute !== 'id' && attribute !== 'supportEnabled' && attribute !== 'commandPrefix')
          .map(attribute => attribute.endsWith('Id') ? attribute.slice(0, -2) : attribute)
          .map(attribute => attribute.toLowerCase())
      }, {
        key: 'value',
        prompt: 'What would you like to change this setting to?',
        type: 'category-channel|channel|message|integer'
      }]
    })
  }

  async execute (message, { key, value }, guild) {
    let error
    if (key === 'primarycolor') {
      if (typeof value !== 'number') {
        value = parseInt(value, 16)
        if (isNaN(value)) {
          error = 'Invalid color.'
        }
      } else if (value < 0 || value > 16777215) { // [0x000000, 0xffffff]
        error = 'Color out of bounds.'
      }
    } else if (key === 'ticketscategory') {
      if (!(value instanceof CategoryChannel)) {
        error = 'Value is not a CategoryChannel.'
      }
    } else if (key === 'trainingsmessage' || key === 'trainingsinfomessage') {
      if (!(value instanceof Message)) {
        error = 'Value is not a Message.'
      }
    } else {
      if (!(value instanceof Channel)) {
        error = 'Value is not a Channel.'
      }
    }
    if (error) {
      return message.reply(error)
    }

    key = Object.keys(Guild.rawAttributes)
      .find(attribute => attribute.slice(0, -2).toLowerCase() === key)

    await guild.edit({ [key]: key.endsWith('Id') ? value.id : value })

    return message.reply(`Successfully changed ${key} to **${value}**.`)
  }
}

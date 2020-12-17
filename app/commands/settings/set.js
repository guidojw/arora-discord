'use strict'
const Command = require('../../controllers/command')

const { Channel, CategoryChannel, Message } = require('discord.js')

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
        oneOf: [
          'primarycolor', 'robloxgroupid', 'logschannel', 'trainingschannel', 'suggestionschannel', 'ratingschannel',
          'supportchannel', 'welcomechannel', 'ticketscategory', 'trainingsmessage', 'trainingsinfomessage',
          'supportmessage'
        ]
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

    await guild.edit({ [key]: value })

    return message.reply(`Successfully changed ${key} to **${value}**.`)
  }
}

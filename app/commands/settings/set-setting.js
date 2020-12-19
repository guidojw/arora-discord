'use strict'
const Command = require('../../controllers/command')

const { Channel, CategoryChannel, Message } = require('discord.js')
const { Guild } = require('../../models')

class SetSettingCommand extends Command {
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
        type: 'category-channel|channel|message|integer|string'
      }]
    })
  }

  async execute (message, { key, value }, guild) {
    key = key.toLowerCase()
    key = Object.keys(Guild.rawAttributes)
      .find(attribute => {
        attribute = attribute.toLowerCase()
        return attribute.endsWith('id') ? attribute.slice(0, -2) === key : attribute === key
      })

    if (typeof value === 'string' && value === 'null') {
      value = null
    } else {
      let error
      if (key === 'primaryColor') {
        if (typeof value !== 'number') {
          value = parseInt(value, 16)
          if (isNaN(value)) {
            error = 'Invalid color.'
          }
        } else if (value < 0 || value > parseInt('0xffffff', 16)) {
          error = 'Color out of bounds.'
        }
      } else if (key === 'robloxGroupId') {
        if (typeof value !== 'number') {
          error = 'Invalid ID.'
        }
      } else if (key === 'ticketsCategoryId') {
        if (!(value instanceof CategoryChannel)) {
          error = 'Invalid category channel.'
        }
      } else if (key === 'trainingsMessageId' || key === 'trainingsInfoMessageId') {
        if (!(value instanceof Message)) {
          error = 'Invalid message.'
        }
      } else {
        if (!(value instanceof Channel)) {
          error = 'Invalid channel.'
        }
      }

      if (error) {
        return message.reply(error)
      }
    }

    await guild.edit({ [key]: value !== null && key.endsWith('Id') && key !== 'robloxGroupId' ? value.id : value })

    return message.reply(`Successfully changed ${key.endsWith('Id') ? key.slice(0, -2) : key} to **${value}**.`)
  }
}

module.exports = SetSettingCommand

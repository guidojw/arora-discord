'use strict'
const BaseCommand = require('../base')

const { CategoryChannel, GuildChannel } = require('discord.js')
const { NSadminTextChannel: TextChannel } = require('../../extensions')
const { Channel: ChannelModel, Guild } = require('../../models')
const { parseNoneOrType } = require('../../util').argumentUtil

class SetSettingCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'setsetting',
      aliases: ['set'],
      description: 'Sets a guild\'s setting.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'setting',
        prompt: 'What setting would you like to change?',
        type: 'string',
        oneOf: Object.keys(Guild.rawAttributes)
          .filter(attribute => !['id', 'supportEnabled', 'commandPrefix'].includes(attribute))
          .map(attribute => attribute.endsWith('Id') ? attribute.slice(0, -2) : attribute)
          .map(attribute => attribute.toLowerCase()),
        parse: parseSetting
      }, {
        key: 'value',
        prompt: 'What would you like to change this setting to? Reply with "none" if you want to reset the setting.',
        type: 'category-channel|text-channel|message|integer|string',
        parse: parseNoneOrType
      }]
    })
  }

  async run (message, { setting, value }) {
    if (typeof value === 'undefined') {
      value = null
    } else {
      let error
      if (setting === 'primaryColor') {
        if (typeof value !== 'number') {
          value = parseInt(value, 16)
          if (isNaN(value)) {
            error = 'Invalid color.'
          }
        } else if (value < 0 || value > parseInt('0xffffff', 16)) {
          error = 'Color out of bounds.'
        }
      } else if (setting === 'robloxGroupId') {
        if (typeof value !== 'number') {
          error = 'Invalid ID.'
        }
      } else {
        if (setting === 'ticketsCategoryId') {
          if (!(value instanceof CategoryChannel)) {
            error = 'Invalid category channel.'
          }
        } else {
          if (!(value instanceof TextChannel)) {
            error = 'Invalid channel.'
          }
        }
        if (!error) {
          await ChannelModel.findOrCreate({ where: { id: value.id, guildId: message.guild.id } })
        }
      }

      if (error) {
        return message.reply(error)
      }
    }

    await message.guild.update({ [setting]: value instanceof GuildChannel ? value.id : value })

    return message.reply(`Successfully changed ${setting.endsWith('Id') ? setting.slice(0, -2) : setting} to ${value instanceof GuildChannel ? value : `\`${value}\``}.`)
  }
}

function parseSetting (val, msg) {
  const lowerCaseVal = val.toLowerCase()
  return Object.keys(Guild.rawAttributes)
    .find(attribute => (
      (attribute.endsWith('Id') ? attribute.slice(0, -2) : attribute).toLowerCase() === lowerCaseVal
    )) || this.type.parse(val, msg, this)
}

module.exports = SetSettingCommand

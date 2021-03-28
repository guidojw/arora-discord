'use strict'

const BaseCommand = require('../base')

const { GuildChannel } = require('discord.js')
const { Guild } = require('../../models')

class GetSettingCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'getsetting',
      aliases: ['get'],
      description: 'Gets a guild\'s setting.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'setting',
        prompt: 'What setting would you like to get?',
        type: 'string',
        oneOf: Object.keys(Guild.rawAttributes)
          .filter(attribute => !['id', 'supportEnabled', 'commandPrefix'].includes(attribute))
          .map(attribute => attribute.endsWith('Id') ? attribute.slice(0, -2) : attribute)
          .map(attribute => attribute.toLowerCase()),
        parse: parseSetting
      }]
    })
  }

  async run (message, { setting }) {
    let result
    if (setting === 'primaryColor') {
      const color = message.guild.primaryColor?.toString(16) ?? ''
      result = `0x${color}${'0'.repeat(6 - color.length)}`
    } else if (setting.includes('Channel') || setting.includes('Category')) {
      setting = setting.slice(0, -2)
      result = message.guild[setting]
    } else {
      result = message.guild[setting]
      setting = setting.slice(0, -2)
    }

    return message.reply(`The ${setting} is ${result instanceof GuildChannel ? result : `\`${result}\``}.`)
  }
}

function parseSetting (val, msg) {
  const lowerCaseVal = val.toLowerCase()
  return Object.keys(Guild.rawAttributes)
    .find(attribute => (
      (attribute.endsWith('Id') ? attribute.slice(0, -2) : attribute).toLowerCase() === lowerCaseVal
    )) || this.type.parse(val, msg, this)
}

module.exports = GetSettingCommand

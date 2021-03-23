'use strict'
const BaseCommand = require('../base')

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
        key: 'key',
        prompt: 'What setting would you like to get?',
        type: 'string',
        oneOf: Object.keys(Guild.rawAttributes)
          .filter(attribute => attribute !== 'id' && attribute !== 'supportEnabled' && attribute !== 'commandPrefix' &&
            attribute !== 'trainingsInfoPanelId' && attribute !== 'trainingsPanelId')
          .map(attribute => attribute.endsWith('Id') ? attribute.slice(0, -2) : attribute)
          .map(attribute => attribute.toLowerCase())
      }]
    })
  }

  async run (message, { key }) {
    key = key.toLowerCase()
    key = Object.keys(Guild.rawAttributes)
      .find(attribute => {
        attribute = attribute.toLowerCase()
        return attribute.endsWith('id') ? attribute.slice(0, -2) === key : attribute === key
      })

    let result
    if (key === 'primaryColor') {
      const color = message.guild.primaryColor.toString(16)
      result = `0x${color}${'0'.repeat(6 - color.length)}`
    } else if (key.includes('Channel')) {
      key = key.slice(0, -2)
      result = message.guild[key]
    } else {
      result = message.guild[key]
      key = key.slice(0, -2)
    }

    return message.reply(`The ${key} is ${key.includes('Channel') ? result : `\`${result}\``}.`)
  }
}

module.exports = GetSettingCommand

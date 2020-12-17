'use strict'
const Command = require('../../controllers/command')

const { Guild } = require('../../models')

module.exports = class GetSettingCommand extends Command {
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
          .filter(attribute => attribute !== 'id' && attribute !== 'supportEnabled' && attribute !== 'commandPrefix')
          .map(attribute => attribute.endsWith('Id') ? attribute.slice(0, -2) : attribute)
          .map(attribute => attribute.toLowerCase())
      }]
    })
  }

  async execute (message, { key }, guild) {
    key = key.toLowerCase()
    key = Object.keys(Guild.rawAttributes)
      .find(attribute => {
        attribute = attribute.toLowerCase()
        return attribute.endsWith('id') ? attribute.slice(0, -2) === key : attribute === key
      })

    let value
    if (key.includes('Channel')) {
      key = key.slice(0, -2)
      value = guild[key]
    } else if (key === 'primaryColor') {
      const color = guild.primaryColor.toString(16)
      value = `0x${color}${'0'.repeat(6 - color.length)}`
    } else {
      value = guild[key]
      key = key.slice(0, -2)
    }

    return message.reply(`${key} is set to **${value}**.`)
  }
}

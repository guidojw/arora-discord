import { ApplicationCommandOptionType } from 'discord-api-types/v9'
import { Constants } from 'discord.js'

const { ActivityTypes } = Constants

const setActivityCommand = {
  name: 'setactivity',
  description: 'Set the bot\'s activity',
  defaultPermission: false,
  options: [{
    name: 'name',
    description: 'The name for the new activity',
    type: ApplicationCommandOptionType.String
  }, {
    name: 'type',
    description: 'The type for the new activity',
    type: ApplicationCommandOptionType.String,
    choices: ActivityTypes
      .filter(type => type !== 'CUSTOM_STATUS')
      .map(type => type.toLowerCase())
      .map(type => ({ name: type, value: type }))
  }]
}

export default setActivityCommand

import { ActivityType, ApplicationCommandOptionType } from 'discord-api-types/v9'
import { util } from '../../utils'

const { getEnumKeys } = util

const choices = getEnumKeys(ActivityType)
  .filter(type => type !== 'CUSTOM_STATUS')
  .map(type => type.toLowerCase())
  .map(type => ({ name: type, value: type }))

const setActivityCommand = {
  name: 'setactivity',
  description: 'Set the bot\'s activity',
  default_permission: false,
  options: [{
    name: 'name',
    description: 'The name for the new activity',
    type: ApplicationCommandOptionType.String
  }, {
    name: 'type',
    description: 'The type for the new activity',
    type: ApplicationCommandOptionType.String,
    choices
  }]
}

export default setActivityCommand

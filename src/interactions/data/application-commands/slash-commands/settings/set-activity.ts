import {
  ActivityType,
  ApplicationCommandOptionType,
  type RESTPutAPIApplicationCommandsJSONBody
} from 'discord.js'
import { util } from '../../../../../utils'

const { getEnumKeys } = util

const choices = getEnumKeys(ActivityType)
  .filter(type => type !== 'CUSTOM_STATUS')
  .map(type => type.toLowerCase())
  .map(type => ({ name: type, value: type }))

const setActivityCommand: RESTPutAPIApplicationCommandsJSONBody[number] = {
  name: 'setactivity',
  description: 'Set the bot\'s activity',
  default_member_permissions: '0',
  dm_permission: false,
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

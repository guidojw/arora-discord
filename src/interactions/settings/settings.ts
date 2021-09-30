import { argumentUtil, util } from '../../util'
import { ApplicationCommandOptionType } from 'discord-api-types/v9'
import { GuildSetting } from '../../extensions'

const { guildSettingTransformer } = argumentUtil
const { getEnumKeys } = util

const choices = getEnumKeys(GuildSetting)
  .map(guildSettingTransformer)
  .map(attribute => attribute.toLowerCase())
  .map(attribute => ({ name: attribute, value: attribute }))

const settingsCommand = {
  name: 'settings',
  description: 'Get or set a guild setting',
  defaultPermission: false,
  options: [{
    name: 'get',
    description: 'Get a guild setting',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'setting',
      description: 'The setting to get',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices
    }]
  }, {
    name: 'set',
    description: 'Set a guild setting',
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: 'setting',
      description: 'The setting to set',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices
    }, {
      name: 'value',
      description: 'The value to change this setting to',
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  }]
}

export default settingsCommand

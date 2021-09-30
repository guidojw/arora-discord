import { argumentUtil, util } from '../../util'
import { ApplicationCommandOptionType } from 'discord-api-types/v9'
import { GuildSetting } from '../../extensions'

const { guildSettingTransformer } = argumentUtil
const { getEnumKeys } = util

const setSettingCommand = {
  name: 'setsetting',
  description: 'Set a guild setting',
  defaultPermission: false,
  options: [{
    name: 'setting',
    description: 'The setting to set',
    type: ApplicationCommandOptionType.String,
    required: true,
    choices: getEnumKeys(GuildSetting)
      .map(guildSettingTransformer)
      .map(attribute => attribute.toLowerCase())
      .map(attribute => ({ name: attribute, value: attribute }))
  }, {
    name: 'value',
    description: 'To value to change this setting to',
    type: ApplicationCommandOptionType.String,
    required: true
  }]
}

export default setSettingCommand

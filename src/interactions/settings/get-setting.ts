import { argumentUtil, util } from '../../util'
import { ApplicationCommandOptionType } from 'discord-api-types/v9'
import { GuildSetting } from '../../extensions'

const { guildSettingTransformer } = argumentUtil
const { getEnumKeys } = util

const getSettingCommand = {
  name: 'getsetting',
  description: 'Get a guild setting',
  defaultPermission: false,
  options: [{
    name: 'setting',
    description: 'The setting to get',
    type: ApplicationCommandOptionType.String,
    required: true,
    choices: getEnumKeys(GuildSetting)
      .map(guildSettingTransformer)
      .map(attribute => attribute.toLowerCase())
      .map(attribute => ({ name: attribute, value: attribute }))
  }]
}

export default getSettingCommand

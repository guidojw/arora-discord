import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import { type Guild, GuildChannel, type Message } from 'discord.js'
import { argumentUtil, util } from '../../util'
import BaseCommand from '../base'
import { GuildSetting } from '../../extensions'

const { guildSettingTransformer, parseEnum } = argumentUtil
const { getEnumKeys } = util

export default class GetSettingCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
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
        oneOf: getEnumKeys(GuildSetting)
          .map(guildSettingTransformer)
          .map(attribute => attribute.toLowerCase()),
        parse: parseEnum(GuildSetting, guildSettingTransformer)
      }]
    })
  }

  public async run (
    message: CommandoMessage & { guild: Guild },
    { setting }: { setting: keyof typeof GuildSetting }
  ): Promise<Message | Message[] | null> {
    let settingName: string = setting
    let result: GuildChannel | string | boolean | number | null
    if (setting === 'primaryColor') {
      const color = message.guild.primaryColor?.toString(16) ?? ''
      result = `0x${color}${'0'.repeat(6 - color.length)}`
    } else if (setting.includes('Channel') || setting.includes('Category')) {
      settingName = setting.slice(0, -2)
      // @ts-expect-error
      result = message.guild[settingName]
    } else if (setting.includes('Id')) {
      result = message.guild[setting]
      settingName = setting.slice(0, -2)
    } else {
      result = message.guild[setting]
    }

    return await message.reply(`The ${settingName} is ${result instanceof GuildChannel ? result.toString() : `\`${String(result)}\``}.`)
  }
}

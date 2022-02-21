import { CategoryChannel, GuildChannel, type Message, TextChannel } from 'discord.js'
import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import { GuildSetting, type GuildUpdateOptions } from '../../extensions'
import { argumentUtil, util } from '../../utils'
import BaseCommand from '../base'
import { VerificationProvider } from '../../utils/constants'

const { guildSettingTransformer, parseEnum, parseNoneOrType } = argumentUtil
const { getEnumKeys, getEnumValues } = util

export default class SetSettingCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'setsetting',
      aliases: ['set'],
      description: 'Sets a guild\'s setting.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'setting',
        prompt: 'What setting would you like to set?',
        type: 'string',
        oneOf: getEnumKeys(GuildSetting)
          .map(guildSettingTransformer)
          .map(attribute => attribute.toLowerCase()),
        parse: parseEnum(GuildSetting, guildSettingTransformer)
      }, {
        key: 'value',
        prompt: 'What would you like to set this setting to? Reply with "none" if you want to reset the setting.',
        type: 'category-channel|text-channel|message|integer|boolean|string',
        parse: parseNoneOrType
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { setting, value }: {
      setting: keyof typeof GuildSetting
      value: CategoryChannel | TextChannel | Message | number | boolean | string | undefined
    }
  ): Promise<Message | Message[] | null> {
    const changes: Pick<GuildUpdateOptions, keyof typeof GuildSetting> = {}
    if (typeof value === 'undefined' && !['robloxUsernamesInNicknames', 'verificationPreference'].includes(setting)) {
      changes[setting as Exclude<typeof setting, 'robloxUsernamesInNicknames' | 'verificationPreference'>] = null
    } else {
      if (setting === 'primaryColor') {
        if (typeof value !== 'number') {
          value = parseInt(String(value), 16)
          if (isNaN(value)) {
            return await message.reply('Invalid color.')
          }
        } else if (value < 0 || value > parseInt('0xffffff', 16)) {
          return await message.reply('Color out of bounds.')
        }

        changes.primaryColor = value
      } else if (setting === 'robloxGroupId') {
        if (typeof value !== 'number') {
          return await message.reply('Invalid ID.')
        }

        changes.robloxGroupId = value
      } else if (setting === 'robloxUsernamesInNicknames') {
        if (typeof value !== 'boolean') {
          return await message.reply('Invalid boolean.')
        }

        changes.robloxUsernamesInNicknames = value
      } else if (setting === 'verificationPreference') {
        if (typeof value !== 'string' || getEnumValues(VerificationProvider).includes(value.toLowerCase())) {
          return await message.reply('Invalid verification provider.')
        }
        value = value.toLowerCase()

        changes.verificationPreference = value as VerificationProvider
      } else if (setting.includes('Channel') || setting.includes('Category')) {
        if (setting === 'ticketsCategoryId') {
          if (!(value instanceof CategoryChannel)) {
            return await message.reply('Invalid category channel.')
          }
        } else {
          if (!(value instanceof TextChannel)) {
            return await message.reply('Invalid channel.')
          }
        }

        changes[setting] = value.id
      }
    }

    await message.guild.update(changes)

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return await message.reply(`Successfully set ${setting.endsWith('Id') ? setting.slice(0, -2) : setting} to ${value instanceof GuildChannel ? value.toString() : `\`${String(value)}\``}.`)
  }
}

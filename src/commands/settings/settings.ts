import { CategoryChannel, type CommandInteraction, GuildChannel, type Message, TextChannel } from 'discord.js'
import { type GuildContext, GuildContextSetting, type GuildContextUpdateOptions } from '../../structures'
import { SubCommandCommand, type SubCommandCommandOptions } from '../base'
import { argumentUtil, util } from '../../utils'
import { ApplyOptions } from '../../utils/decorators'
import { VerificationProvider } from '../../utils/constants'
import { injectable } from 'inversify'

const { getEnumValues } = util
const { guildContextSettingTransformer, parseEnum } = argumentUtil

@injectable()
@ApplyOptions<SubCommandCommandOptions<SettingsCommand>>({
  subCommands: {
    get: {
      args: [
        {
          key: 'setting',
          parse: parseEnum(GuildContextSetting, guildContextSettingTransformer)
        }
      ]
    },
    set: {
      args: [
        {
          key: 'setting',
          parse: parseEnum(GuildContextSetting, guildContextSettingTransformer)
        },
        { key: 'value', required: false }
      ]
    }
  }
})
export default class SettingsCommand extends SubCommandCommand<SettingsCommand> {
  public async get (
    interaction: CommandInteraction,
    { setting }: { setting: keyof typeof GuildContextSetting }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext

    let settingName: string = setting
    let result: GuildChannel | string | boolean | number | null
    if (setting === 'primaryColor') {
      const color = context.primaryColor?.toString(16) ?? ''
      result = `0x${color}${'0'.repeat(6 - color.length)}`
    } else if (setting.includes('Channel') || setting.includes('Category')) {
      settingName = setting.slice(0, -2)
      // @ts-expect-error
      result = message.guild[settingName]
    } else if (setting.includes('Id')) {
      result = context[setting]
      settingName = setting.slice(0, -2)
    } else {
      result = context[setting]
    }

    return await interaction.reply(`The ${settingName} is ${result instanceof GuildChannel ? result.toString() : `\`${String(result)}\``}.`)
  }

  public async set (
    interaction: CommandInteraction,
    { setting, value }: {
      setting: keyof typeof GuildContextSetting
      value: CategoryChannel | TextChannel | Message | number | boolean | string | null
    }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext

    const changes: Pick<GuildContextUpdateOptions, keyof typeof GuildContextSetting> = {}
    if (typeof value === 'undefined' && !['robloxUsernamesInNicknames', 'verificationPreference'].includes(setting)) {
      changes[setting as Exclude<typeof setting, 'robloxUsernamesInNicknames' | 'verificationPreference'>] = null
    } else {
      if (setting === 'primaryColor') {
        if (typeof value !== 'number') {
          value = parseInt(String(value), 16)
          if (isNaN(value)) {
            return await interaction.reply('Invalid color.')
          }
        } else if (value < 0 || value > parseInt('0xffffff', 16)) {
          return await interaction.reply('Color out of bounds.')
        }

        changes.primaryColor = value
      } else if (setting === 'robloxGroupId') {
        if (typeof value !== 'number') {
          return await interaction.reply('Invalid ID.')
        }

        changes.robloxGroupId = value
      } else if (setting === 'robloxUsernamesInNicknames') {
        if (typeof value !== 'boolean') {
          return await interaction.reply('Invalid boolean.')
        }

        changes.robloxUsernamesInNicknames = value
      } else if (setting === 'verificationPreference') {
        if (typeof value !== 'string' || getEnumValues(VerificationProvider).includes(value.toLowerCase())) {
          return await interaction.reply('Invalid verification provider.')
        }
        value = value.toLowerCase()

        changes.verificationPreference = value as VerificationProvider
      } else if (setting.includes('Channel') || setting.includes('Category')) {
        if (setting === 'ticketsCategoryId') {
          if (!(value instanceof CategoryChannel)) {
            return await interaction.reply('Invalid category channel.')
          }
        } else {
          if (!(value instanceof TextChannel)) {
            return await interaction.reply('Invalid channel.')
          }
        }

        changes[setting] = value.id
      }
    }

    await context.update(changes)

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return await interaction.reply(`Successfully set ${setting.endsWith('Id') ? setting.slice(0, -2) : setting} to ${value instanceof GuildChannel ? value.toString() : `\`${String(value)}\``}.`)
  }
}

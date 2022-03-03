import { CategoryChannel, type CommandInteraction, GuildChannel, TextChannel } from 'discord.js'
import type { GuildContext, GuildUpdateOptions } from '../../../../structures'
import { SubCommandCommand, type SubCommandCommandOptions } from '../base'
import { argumentUtil, constants, util } from '../../../../utils'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import type { GuildContextManager } from '../../../../managers'
import { VerificationProvider } from '../../../../utils/constants'

const GuildSetting = constants.GuildSetting
const { TYPES } = constants
const { getEnumValues } = util
const { guildSettingTransformer, parseEnum } = argumentUtil

@injectable()
@ApplyOptions<SubCommandCommandOptions<SettingsCommand>>({
  subCommands: {
    get: {
      args: [
        {
          key: 'setting',
          parse: parseEnum(GuildSetting, guildSettingTransformer)
        }
      ]
    },
    set: {
      args: [
        {
          key: 'setting',
          parse: parseEnum(GuildSetting, guildSettingTransformer)
        },
        {
          key: 'value',
          type: 'category-channel|text-channel|integer|boolean|always',
          required: false
        }
      ]
    }
  }
})
export default class SettingsCommand extends SubCommandCommand<SettingsCommand> {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async get (
    interaction: CommandInteraction,
    { setting }: { setting: keyof typeof GuildSetting }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    let settingName: string = setting
    let result: GuildChannel | string | boolean | number | null
    if (setting === 'primaryColor') {
      const color = context.primaryColor?.toString(16) ?? ''
      result = `0x${color}${'0'.repeat(6 - color.length)}`
    } else if (setting.includes('Channel') || setting.includes('Category')) {
      settingName = guildSettingTransformer(setting)
      result = context[settingName as keyof GuildContext] as GuildChannel
    } else if (setting.includes('Id')) {
      result = context[setting]
      settingName = guildSettingTransformer(setting)
    } else {
      result = context[setting]
    }

    return await interaction.reply(`The ${settingName} is ${result instanceof GuildChannel ? result.toString() : `\`${String(result)}\``}.`)
  }

  public async set (
    interaction: CommandInteraction,
    { setting, value }: {
      setting: keyof typeof GuildSetting
      value: CategoryChannel | TextChannel | number | boolean | string | null
    }
  ): Promise<void> {
    if (!interaction.inGuild()) {
      return
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const changes: GuildUpdateOptions = {}
    if (value === null && !['robloxUsernamesInNicknames', 'verificationPreference'].includes(setting)) {
      changes[
        guildSettingTransformer(setting) as keyof Omit<
        GuildUpdateOptions,
        'robloxUsernamesInNicknames' | 'verificationPreference' | 'supportEnabled'
        >
      ] = null
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

        changes.robloxGroup = value
      } else if (setting === 'robloxUsernamesInNicknames') {
        if (typeof value !== 'boolean') {
          return await interaction.reply('Invalid boolean.')
        }

        changes.robloxUsernamesInNicknames = value
      } else if (setting === 'verificationPreference') {
        if (typeof value !== 'string' || !getEnumValues(VerificationProvider).includes(value.toLowerCase())) {
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

        changes[
          guildSettingTransformer(setting) as keyof Pick<
          GuildUpdateOptions,
          'logsChannel' | 'ratingsChannel' | 'suggestionsChannel' | 'ticketArchivesChannel' | 'ticketsCategory'
          >
        ] = value.id
      }
    }

    await context.update(changes)

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return await interaction.reply(`Successfully set ${guildSettingTransformer(setting)} to ${value instanceof GuildChannel ? value.toString() : `\`${String(value)}\``}.`)
  }
}

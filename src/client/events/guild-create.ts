import { inject, injectable } from 'inversify'
import type { BaseHandler } from '..'
import type { Guild } from 'discord.js'
import SettingProvider from '../setting-provider'
import { constants } from '../../utils'

const { TYPES } = constants

@injectable()
export default class GuildCreateEventHandler implements BaseHandler {
  @inject(TYPES.SettingProvider)
  private readonly settingProvider!: SettingProvider

  public async handle (guild: Guild): Promise<void> {
    await this.settingProvider.setupGuild(guild)
  }
}

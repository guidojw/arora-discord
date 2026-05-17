import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import type { ChangeMemberRole } from '../../../../services/group'
import type { ChatInputCommandInteraction } from 'discord.js'
import { Command } from '../base'
import type { CommandOptions } from '..'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import type { RobloxUser } from '../../../../argument-types'
import { applicationAdapter } from '../../../../adapters'
import axios from 'axios'
import { constants } from '../../../../utils'
import { oAuthService } from '../../../../services'

const { TYPES } = constants

@injectable()
@ApplyOptions<CommandOptions>({
  requiresApi: true,
  requiresRobloxGroup: true,
  command: {
    args: [{ key: 'username', name: 'user', type: 'roblox-user' }]
  }
})
export default class PromoteCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { user }: { user: RobloxUser }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    let authorId
    try {
      authorId = parseInt((await oAuthService.fetchUserInfo(interaction.user.id)).sub)
    } catch (err) {
      if (axios.isAxiosError(err) && typeof err.response !== 'undefined' && err.response.status === 404) {
        await interaction.reply({
          content: 'Could not get user info, please `/verify`',
          ephemeral: true
        })
        return
      }
      throw err
    }

    await interaction.deferReply()

    const roles: ChangeMemberRole = (await applicationAdapter('POST', `v2/groups/${context.robloxGroupId}/users/${user.id}/promote`, {
      authorId
    })).data

    await interaction.editReply(`Successfully promoted **${user.username ?? user.id}** from **${roles.oldRole.displayName}** to **${roles.newRole.displayName}**.`)
  }
}

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
import { constants } from '../../../../utils'
import { verificationService } from '../../../../services'

const { TYPES } = constants

@injectable()
@ApplyOptions<CommandOptions>({
  requiresApi: true,
  requiresRobloxGroup: true,
  command: {
    args: [{ key: 'username', name: 'user', type: 'roblox-user' }]
  }
})
export default class DemoteCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { user }: { user: RobloxUser }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    const authorId = (await verificationService.fetchVerificationData(
      interaction.user.id,
      interaction.guildId
    ))?.robloxId
    if (typeof authorId === 'undefined') {
      await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
      return
    }

    await interaction.deferReply()

    const roles: ChangeMemberRole = (await applicationAdapter('POST', `v1/groups/${context.robloxGroupId}/users/${user.id}/demote`, {
      authorId
    })).data

    await interaction.editReply(`Successfully demoted **${user.username ?? user.id}** from **${roles.oldRole.name}** to **${roles.newRole.name}**.`)
  }
}

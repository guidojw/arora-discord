import type { BaseGuildCommandInteraction, CommandInteraction } from 'discord.js'
import { ApplyOptions } from '../../util/decorators'
import type { ChangeMemberRole } from '../../services/group'
import { Command } from '../base'
import type { CommandOptions } from '../base'
import type { GuildContext } from '../../structures'
import type { RobloxUser } from '../../types/roblox-user'
import { applicationAdapter } from '../../adapters'
import { injectable } from 'inversify'
import { verificationService } from '../../services'

@injectable()
@ApplyOptions<CommandOptions>({
  requiresApi: true,
  requiresRobloxGroup: true,
  command: {
    args: [{ key: 'username', name: 'user', type: 'roblox-user' }]
  }
})
export default class PromoteCommand extends Command {
  public async execute (
    interaction: CommandInteraction & BaseGuildCommandInteraction<'cached'>,
    { user }: { user: RobloxUser }
  ): Promise<void> {
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext & { robloxGroupId: number }

    const authorId = (await verificationService.fetchVerificationData(interaction.user.id))?.robloxId
    if (typeof authorId === 'undefined') {
      return await interaction.reply({
        content: 'This command requires you to be verified with a verification provider.',
        ephemeral: true
      })
    }

    const roles: ChangeMemberRole = (await applicationAdapter('POST', `v1/groups/${context.robloxGroupId}/users/${user.id}/promote`, {
      authorId
    })).data

    return await interaction.reply(`Successfully promoted **${user.username ?? user.id}** from **${roles.oldRole.name}** to **${roles.newRole.name}**.`)
  }
}

import { type ChatInputCommandInteraction, EmbedBuilder, type GuildMember, type Role } from 'discord.js'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import { PersistentRoleService } from '../../../../services'
import { SubCommandCommand } from '../base'
import type { SubCommandCommandOptions } from '..'
import applicationConfig from '../../../../configs/application'
import { constants } from '../../../../utils'

const { TYPES } = constants

@injectable()
@ApplyOptions<SubCommandCommandOptions<PersistentRolesCommand>>({
  subCommands: {
    persist: {
      args: [{ key: 'member' }, { key: 'role' }]
    },
    unpersist: {
      args: [{ key: 'member' }, { key: 'role' }]
    },
    list: {
      args: [{ key: 'member' }]
    }
  }
})
export default class PersistentRolesCommand extends SubCommandCommand<PersistentRolesCommand> {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  @inject(TYPES.PersistentRoleService)
  private readonly persistentRoleService!: PersistentRoleService

  public async persist (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { member, role }: { member: GuildMember, role: Role }
  ): Promise<void> {
    await this.persistentRoleService.persistRole(member, role)

    await interaction.reply({
      content: `Successfully persisted role **${role.toString()}** on member **${member.toString()}**.`,
      allowedMentions: {}
    })
  }

  public async unpersist (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { member, role }: { member: GuildMember, role: Role }
  ): Promise<void> {
    await this.persistentRoleService.unpersistRole(member, role)

    await interaction.reply({
      content: `Successfully removed persistent role **${role.toString()}** from member **${member.toString()}**.`,
      allowedMentions: {}
    })
  }

  public async list (
    interaction: ChatInputCommandInteraction<'raw' | 'cached'>,
    { member }: { member: GuildMember }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const persistentRoles = await this.persistentRoleService.fetchPersistentRoles(member)
    if (persistentRoles.size === 0) {
      await interaction.reply('No persistent roles found.')
      return
    }

    const embed = new EmbedBuilder()
      .setTitle(`${member.user.username}'s Persistent Roles`)
      .setDescription(persistentRoles.map(role => role.toString()).toString())
      .setColor(context.primaryColor ?? applicationConfig.defaultColor)
    await interaction.reply({ embeds: [embed] })
  }
}

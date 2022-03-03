import { type CommandInteraction, type GuildMember, MessageEmbed, type Role } from 'discord.js'
import { SubCommandCommand, type SubCommandCommandOptions } from '../base'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../utils/decorators'
import type { GuildContext } from '../../structures'
import type { GuildContextManager } from '../../managers'
import type { PersistentRoleService } from '../../services'
import applicationConfig from '../../configs/application'
import { constants } from '../../utils'

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
    interaction: CommandInteraction<'present'>,
    { member, role }: { member: GuildMember, role: Role }
  ): Promise<void> {
    await this.persistentRoleService.persistRole(member, role)

    return await interaction.reply({
      content: `Successfully persisted role **${role.toString()}** on member **${member.toString()}**.`,
      allowedMentions: {}
    })
  }

  public async unpersist (
    interaction: CommandInteraction<'present'>,
    { member, role }: { member: GuildMember, role: Role }
  ): Promise<void> {
    await this.persistentRoleService.unpersistRole(member, role)

    return await interaction.reply({
      content: `Successfully removed persistent role **${role.toString()}** from member **${member.toString()}**.`,
      allowedMentions: {}
    })
  }

  public async list (
    interaction: CommandInteraction<'present'>,
    { member }: { member: GuildMember }
  ): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const persistentRoles = await this.persistentRoleService.fetchPersistentRoles(member)
    if (persistentRoles.size === 0) {
      return await interaction.reply('No persistent roles found.')
    }

    const embed = new MessageEmbed()
      .setTitle(`${member.user.tag}'s Persistent Roles`)
      .setDescription(persistentRoles.map(role => role.toString()).toString())
      .setColor(context.primaryColor ?? applicationConfig.defaultColor)
    return await interaction.reply({ embeds: [embed] })
  }
}

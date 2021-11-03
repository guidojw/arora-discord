import type { BaseGuildCommandInteraction, CommandInteraction, GuildMember, Role } from 'discord.js'
import { inject, injectable } from 'inversify'
import { ApplyOptions } from '../../util/decorators'
import type { GuildContext } from '../../structures'
import { MessageEmbed } from 'discord.js'
import type { PersistentRoleService } from '../../services'
import { SubCommandCommand } from '../base'
import type { SubCommandCommandOptions } from '../base'
import applicationConfig from '../../configs/application'
import { constants } from '../../util'

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
  @inject(TYPES.PersistentRoleService)
  private readonly persistentRoleService!: PersistentRoleService

  public async persist (
    interaction: CommandInteraction & BaseGuildCommandInteraction<'cached'>,
    { member, role }: { member: GuildMember, role: Role }
  ): Promise<void> {
    await this.persistentRoleService.persistRole(member, role)

    return await interaction.reply({
      content: `Successfully persisted role **${role.toString()}** on member **${member.toString()}**.`,
      allowedMentions: {}
    })
  }

  public async unpersist (
    interaction: CommandInteraction & BaseGuildCommandInteraction<'cached'>,
    { member, role }: { member: GuildMember, role: Role }
  ): Promise<void> {
    await this.persistentRoleService.unpersistRole(member, role)

    return await interaction.reply({
      content: `Successfully removed persistent role **${role.toString()}** from member **${member.toString()}**.`,
      allowedMentions: {}
    })
  }

  public async list (
    interaction: CommandInteraction & BaseGuildCommandInteraction<'cached'>,
    { member }: { member: GuildMember }
  ): Promise<void> {
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext

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

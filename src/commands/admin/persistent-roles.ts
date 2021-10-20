import type { BaseGuildCommandInteraction, CommandInteraction, GuildMember, Role } from 'discord.js'
import { Collection, MessageEmbed } from 'discord.js'
import type { Member as MemberEntity, Role as RoleEntity } from '../../entities'
import { inject, injectable } from 'inversify'
import { ApplyOptions } from '../../util/decorators'
import type { GuildContext } from '../../structures'
import type { Repository } from 'typeorm'
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
  @inject(TYPES.MemberRepository)
  private readonly memberRepository!: Repository<MemberEntity>

  public async persist (
    interaction: CommandInteraction & BaseGuildCommandInteraction<'cached'>,
    { member, role }: { member: GuildMember, role: Role }
  ): Promise<void> {
    await this.persistRole(interaction, member, role)

    return await interaction.reply({
      content: `Successfully persisted role **${role.toString()}** on member **${member.toString()}**.`,
      allowedMentions: {}
    })
  }

  public async unpersist (
    interaction: CommandInteraction & BaseGuildCommandInteraction<'cached'>,
    { member, role }: { member: GuildMember, role: Role }
  ): Promise<void> {
    await this.unpersistRole(member, role)

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

    const persistentRoles = await this.fetchPersistentRoles(interaction, member)
    if (persistentRoles.size === 0) {
      return await interaction.reply('No persistent roles found.')
    }

    const embed = new MessageEmbed()
      .setTitle(`${member.user.tag}'s Persistent Roles`)
      .setDescription(persistentRoles.map(role => role.toString()).toString())
      .setColor(context.primaryColor ?? applicationConfig.defaultColor)
    return await interaction.reply({ embeds: [embed] })
  }

  private async fetchPersistentRoles (
    interaction: BaseGuildCommandInteraction<'cached'>,
    member: GuildMember
  ): Promise<Collection<string, Role>> {
    const data = await this.getData(member)

    return interaction.guild.roles.cache.filter(role => (
      data?.roles.some(persistentRole => persistentRole.id === role.id) === true
    ))
  }

  private async persistRole (
    interaction: BaseGuildCommandInteraction<'cached'>,
    member: GuildMember,
    role: Role
  ): Promise<this> {
    await member.roles.add(role)
    const data = await this.getData(member) ?? await this.memberRepository.save(this.memberRepository.create({
      userId: member.id,
      guildId: member.guild.id
    }))
    if (typeof data.roles === 'undefined') {
      data.roles = []
    }

    if (data.roles.some(otherRole => otherRole.id === role.id)) {
      throw new Error('Member does already have role.')
    } else {
      data.roles.push({ id: role.id, guildId: interaction.guild.id })
      await this.memberRepository.save(data)
      return this
    }
  }

  private async unpersistRole (member: GuildMember, role: Role): Promise<this> {
    const data = await this.getData(member)

    if (typeof data === 'undefined' || !data?.roles.some(otherRole => otherRole.id === role.id)) {
      throw new Error('Member does not have role.')
    } else {
      data.roles = data.roles.filter(otherRole => otherRole.id !== role.id)
      await this.memberRepository.save(data)
      await member.roles.remove(role)
      return this
    }
  }

  private async getData (member: GuildMember): Promise<(MemberEntity & { roles: RoleEntity[] }) | undefined> {
    return await this.memberRepository.findOne(
      { userId: member.id, guildId: member.guild.id },
      { relations: ['moderatingTickets', 'roles'] }
    ) as (MemberEntity & { roles: RoleEntity[] }) | undefined
  }
}

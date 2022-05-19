import type { Collection, GuildMember, Role } from 'discord.js'
import type { Member as MemberEntity, Role as RoleEntity } from '../entities'
import { inject, injectable } from 'inversify'
import type { Repository } from 'typeorm'
import { constants } from '../utils'

const { TYPES } = constants

@injectable()
export default class PersistentRoleService {
  @inject(TYPES.MemberRepository)
  private readonly memberRepository!: Repository<MemberEntity>

  public async fetchPersistentRoles (member: GuildMember): Promise<Collection<string, Role>> {
    const data = await this.getData(member)

    return member.guild.roles.cache.filter(role => (
      data?.roles.some(persistentRole => persistentRole.id === role.id) === true
    ))
  }

  public async persistRole (member: GuildMember, role: Role): Promise<void> {
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
      data.roles.push({ id: role.id, guildId: member.guild.id })
      await this.memberRepository.save(data)
    }
  }

  public async unpersistRole (member: GuildMember, role: Role): Promise<void> {
    const data = await this.getData(member)

    if (data === null || !data?.roles.some(otherRole => otherRole.id === role.id)) {
      throw new Error('Member does not have role.')
    } else {
      data.roles = data.roles.filter(otherRole => otherRole.id !== role.id)
      await this.memberRepository.save(data)
      await member.roles.remove(role)
    }
  }

  private async getData (member: GuildMember): Promise<(MemberEntity & { roles: RoleEntity[] }) | null> {
    return await this.memberRepository.findOne({
      where: { userId: member.id, guildId: member.guild.id },
      relations: { moderatingTickets: true, roles: true }
    }) as (MemberEntity & { roles: RoleEntity[] }) | null
  }
}

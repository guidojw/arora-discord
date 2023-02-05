import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import { IsArray, IsNumberString, ValidateIf, ValidateNested } from 'class-validator'
import Group from './group'
import Guild from './guild'
import Member from './member'
import RoleBinding from './role-binding'
import RoleMessage from './role-message'

@Entity('roles')
export default class Role {
  @PrimaryColumn({ type: 'bigint' })
  @IsNumberString({ no_symbols: true })
  public id!: string

  @Column('bigint', { name: 'guild_id' })
  @IsNumberString({ no_symbols: true })
  public guildId!: string

  @ManyToOne(() => Guild, guild => guild.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  @ValidateIf(role => typeof role.guild !== 'undefined')
  @ValidateNested()
  public guild?: Guild

  @ManyToMany(() => Group, group => group.roles)
  @ValidateIf(role => typeof role.groups !== 'undefined')
  @ValidateNested()
  @IsArray()
  public groups?: Group[]

  @OneToMany(() => RoleMessage, roleMessage => roleMessage.role)
  @ValidateIf(role => typeof role.roleMessages !== 'undefined')
  @ValidateNested()
  @IsArray()
  public roleMessages?: RoleMessage[]

  @OneToMany(() => RoleBinding, roleBinding => roleBinding.role)
  @ValidateIf(role => typeof role.roleBindings !== 'undefined')
  @ValidateNested()
  @IsArray()
  public roleBindings?: RoleBinding[]

  @ManyToMany(() => Member, member => member.roles)
  @ValidateIf(role => typeof role.members !== 'undefined')
  @ValidateNested()
  @IsArray()
  public members?: Member[]
}

import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import Group from './group'
import Guild from './guild'
import Member from './member'
import Permission from './permission'
import RoleBinding from './role-binding'
import RoleMessage from './role-message'

@Entity('roles')
export default class Role {
  @Expose()
  @PrimaryColumn({ type: 'bigint' })
  public id!: string

  @Expose({ name: 'guild_id' })
  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Expose()
  @Type(() => Guild)
  @ManyToOne(() => Guild, guild => guild.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  @Expose()
  @Type(() => Group)
  @ManyToMany(() => Group, group => group.roles)
  @JoinTable({
    name: 'roles_groups',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'group_id' }
  })
  public groups?: Group[]

  @Expose({ name: 'role_messages' })
  @Type(() => RoleMessage)
  @OneToMany(() => RoleMessage, roleMessage => roleMessage.role)
  public roleMessages?: RoleMessage[]

  @Expose({ name: 'role_bindings' })
  @Type(() => RoleBinding)
  @OneToMany(() => RoleBinding, roleBinding => roleBinding.role)
  public roleBindings?: RoleBinding[]

  @Expose()
  @Type(() => Member)
  @ManyToMany(() => Member, member => member.roles)
  public members?: Member[]

  @Expose()
  @Type(() => Permission)
  @OneToMany(() => Permission, permission => permission.role)
  public permissions?: Permission[]
}

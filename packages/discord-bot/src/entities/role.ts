import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import Group from './group'
import Guild from './guild'
import Member from './member'
import RoleBinding from './role-binding'
import RoleMessage from './role-message'

@Entity('roles')
export default class Role {
  @PrimaryColumn({ type: 'bigint' })
  public id!: string

  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @ManyToOne(() => Guild, guild => guild.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  @ManyToMany(() => Group, group => group.roles)
  public groups?: Group[]

  @OneToMany(() => RoleMessage, roleMessage => roleMessage.role)
  public roleMessages?: RoleMessage[]

  @OneToMany(() => RoleBinding, roleBinding => roleBinding.role)
  public roleBindings?: RoleBinding[]

  @ManyToMany(() => Member, member => member.roles)
  public members?: Member[]
}

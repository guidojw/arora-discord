import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Guild from './guild'
import Role from './role'

@Entity('role_bindings')
export default class RoleBinding {
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Column({ name: 'roblox_group_id' })
  public robloxGroupId!: number

  @Column()
  public min!: number

  @Column('int', { nullable: true })
  public max?: number | null

  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Column('bigint', { name: 'role_id' })
  public roleId!: string

  @ManyToOne(() => Guild, guild => guild.roleBindings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  @ManyToOne(() => Role, role => role.roleBindings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  public role?: Role
}

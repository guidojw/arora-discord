import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import Guild from './guild'
import Role from './role'

@Entity({ name: 'role_bindings' })
export default class RoleBinding {
  @Expose()
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Expose({ name: 'roblox_group_id' })
  @Column({ name: 'roblox_group_id' })
  public robloxGroupId!: number

  @Expose()
  @Column()
  public min!: number

  @Expose()
  @Column('int', { nullable: true })
  public max?: number | null

  @Expose({ name: 'guild_id' })
  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Expose({ name: 'role_id' })
  @Column('bigint', { name: 'role_id' })
  public roleId!: string

  @Expose()
  @Type(() => Guild)
  @ManyToOne(() => Guild, guild => guild.roleBindings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild!: Guild

  @Expose()
  @Type(() => Role)
  @ManyToOne(() => Role, role => role.roleBindings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  public role!: Role
}

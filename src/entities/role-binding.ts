import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { IsNumber, IsNumberString, IsOptional, ValidateIf, ValidateNested } from 'class-validator'
import Guild from './guild'
import Role from './role'

@Entity('role_bindings')
export default class RoleBinding {
  @PrimaryGeneratedColumn()
  @ValidateIf(roleBinding => typeof roleBinding.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Column({ name: 'roblox_group_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public robloxGroupId!: number

  @Column()
  @IsNumber({ maxDecimalPlaces: 0 })
  public min!: number

  @Column('int', { nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  public max?: number | null

  @Column('bigint', { name: 'guild_id' })
  @IsNumberString({ no_symbols: true })
  public guildId!: string

  @Column('bigint', { name: 'role_id' })
  @IsNumberString({ no_symbols: true })
  public roleId!: string

  @ManyToOne(() => Guild, guild => guild.roleBindings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  @ValidateIf(roleBinding => typeof roleBinding.guild !== 'undefined')
  @ValidateNested()
  public guild?: Guild

  @ManyToOne(() => Role, role => role.roleBindings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  @ValidateIf(roleBinding => typeof roleBinding.role !== 'undefined')
  @ValidateNested()
  public role?: Role
}

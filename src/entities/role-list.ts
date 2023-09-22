import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested
} from 'class-validator'
import Guild from './guild'
import Message from './message'
import RoleRoleList from './role-role-list'

@Entity('role_lists')
export default class RoleList {
  @PrimaryGeneratedColumn()
  @ValidateIf(roleList => typeof roleList.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Column({ length: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public name!: string

  @Column('bigint', { name: 'guild_id' })
  @IsNumberString({ no_symbols: true })
  public guildId!: string

  @Column('bigint', { name: 'message_id', nullable: true, unique: true })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  public messageId?: string | null

  @ManyToOne(() => Guild, guild => guild.roleLists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  @ValidateIf(roleList => typeof roleList.guild !== 'undefined')
  @ValidateNested()
  public guild?: Guild

  @ManyToOne(() => Message, message => message.roleLists, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'message_id' })
  @IsOptional()
  @ValidateNested()
  public message?: Message | null

  @OneToMany(() => RoleRoleList, roleRoleList => roleRoleList.roleList)
  @ValidateIf(role => typeof role.roleRoleLists !== 'undefined')
  @ValidateNested()
  @IsArray()
  public roleRoleLists?: RoleRoleList[]
}

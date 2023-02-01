import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested
} from 'class-validator'
import Channel from './channel'
import { GroupType } from '../utils/constants'
import Guild from './guild'
import Role from './role'

@Entity('groups')
export default class Group {
  @PrimaryGeneratedColumn()
  @ValidateIf(group => typeof group.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Column({ length: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public name!: string

  @Column({ type: 'enum', enum: GroupType })
  @IsEnum(GroupType)
  public type!: GroupType

  @Column({ default: false })
  @IsBoolean()
  public guarded!: boolean

  @Column('bigint', { name: 'guild_id' })
  @IsNumberString({ no_symbols: true })
  public guildId!: string

  @ManyToOne(() => Guild, guild => guild.groups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  @ValidateIf(group => typeof group.guild !== 'undefined')
  @ValidateNested()
  public guild?: Guild

  @ManyToMany(() => Channel, channel => channel.groups, { cascade: true })
  @JoinTable({
    name: 'channels_groups',
    joinColumn: { name: 'group_id' },
    inverseJoinColumn: { name: 'channel_id' }
  })
  @ValidateIf(group => typeof group.channels !== 'undefined')
  @ValidateNested()
  public channels?: Channel[]

  @ManyToMany(() => Role, role => role.groups, { cascade: true })
  @JoinTable({
    name: 'roles_groups',
    joinColumn: { name: 'group_id' },
    inverseJoinColumn: { name: 'role_id' }
  })
  @ValidateIf(group => typeof group.roles !== 'undefined')
  @ValidateNested()
  public roles?: Role[]
}

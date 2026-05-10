import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested
} from 'class-validator'
import Guild from './guild'
import { InfractionType } from '../utils/constants'

@Entity('infractions')
export default class Infraction {
  @PrimaryGeneratedColumn()
  @ValidateIf(infraction => typeof infraction.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @CreateDateColumn({ name: 'created_at' })
  @ValidateIf(infraction => typeof infraction.createdAt !== 'undefined')
  @IsDate()
  public readonly createdAt!: Date

  @Column('bigint', { name: 'user_id' })
  @IsNumberString({ no_symbols: true })
  public userId!: string

  @Column('bigint', { name: 'author_id' })
  @IsNumberString({ no_symbols: true })
  public authorId!: string

  @Column('enum', { enum: InfractionType })
  @IsEnum(InfractionType)
  public type!: InfractionType

  @Column({ default: false })
  @ValidateIf(infraction => typeof infraction.active !== 'undefined')
  @IsBoolean()
  public active!: boolean

  @Column({ length: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public reason!: string

  @Column('bigint', { name: 'guild_id' })
  @IsNumberString({ no_symbols: true })
  public guildId!: string

  @ManyToOne(() => Guild, guild => guild.infractions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  @ValidateIf(infraction => typeof infraction.guild !== 'undefined')
  @ValidateNested()
  public guild?: Guild
}

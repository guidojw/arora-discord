import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { IsNumber, IsNumberString, IsOptional, IsString, MaxLength, ValidateIf, ValidateNested } from 'class-validator'
import Guild from './guild'
import Message from './message'

@Entity('panels')
export default class Panel {
  @PrimaryGeneratedColumn()
  @ValidateIf(panel => typeof panel.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Column({ length: 255 })
  @IsString()
  @MaxLength(255)
  public name!: string

  @Column({ length: 7000 })
  @IsString()
  @MaxLength(7000)
  public content!: string

  @Column('bigint', { name: 'guild_id' })
  @IsNumberString({ no_symbols: true })
  public guildId!: string

  @Column('bigint', { name: 'message_id', nullable: true, unique: true })
  @IsOptional()
  @IsString()
  public messageId?: string | null

  @ManyToOne(() => Guild, guild => guild.panels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  @ValidateIf(panel => typeof panel.guild !== 'undefined')
  @ValidateNested()
  public guild?: Guild

  @ManyToOne(() => Message, message => message.panel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'message_id' })
  @IsOptional()
  @ValidateNested()
  public message?: Message | null
}

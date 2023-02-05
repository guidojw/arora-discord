import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
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
import Ticket from './ticket'

@Entity('ticket_types')
export default class TicketType {
  @PrimaryGeneratedColumn()
  @ValidateIf(ticketType => typeof ticketType.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Column({ length: 16 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  public name!: string

  @Column('bigint', { name: 'guild_id' })
  @IsNumberString({ no_symbols: true })
  public guildId!: string

  @Column('bigint', { name: 'message_id' })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  public messageId?: string | null

  @ManyToOne(() => Guild, guild => guild.ticketTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  @ValidateIf(ticketType => typeof ticketType.guild !== 'undefined')
  @ValidateNested()
  public guild?: Guild

  @OneToOne(() => Message, message => message.ticketType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  public message?: Message | null

  @OneToMany(() => Ticket, ticket => ticket.type)
  @ValidateIf(ticketType => typeof ticketType.tickets !== 'undefined')
  @ValidateNested()
  @IsArray()
  public tickets?: Ticket[]
}

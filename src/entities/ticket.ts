import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { IsArray, IsNumber, IsNumberString, IsOptional, ValidateIf, ValidateNested } from 'class-validator'
import Channel from './channel'
import Guild from './guild'
import Member from './member'
import TicketType from './ticket-type'

@Entity('tickets')
export default class Ticket {
  @PrimaryGeneratedColumn()
  @ValidateIf(ticket => typeof ticket.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Column('int', { name: 'author_id' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  public authorId?: number | null

  @Column('bigint', { name: 'channel_id', nullable: true })
  @IsNumberString({ no_symbols: true })
  public channelId!: string

  @Column('int', { name: 'type_id', nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  public typeId?: number | null

  @Column('bigint', { name: 'guild_id' })
  @IsNumberString({ no_symbols: true })
  public guildId!: string

  @ManyToOne(() => Guild, guild => guild.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  @ValidateIf(ticket => typeof ticket.guild !== 'undefined')
  @ValidateNested()
  public guild?: Guild

  @ManyToMany(() => Member, member => member.moderatingTickets)
  @ValidateIf(ticket => typeof ticket.moderators !== 'undefined')
  @ValidateNested()
  @IsArray()
  public moderators?: Member[]

  @ManyToOne(() => Member, member => member.tickets, { onDelete: 'CASCADE' }) // FIXME: should be SET NULL
  @JoinColumn({ name: 'author_id' })
  @IsOptional()
  @ValidateNested()
  public author?: Member | null

  @OneToOne(() => Channel, channel => channel.ticket, { onDelete: 'SET NULL' }) // FIXME: should be CASCADE
  @JoinColumn({ name: 'channel_id' })
  @ValidateIf(ticket => typeof ticket.channel !== 'undefined')
  @ValidateNested()
  public channel?: Channel

  @ManyToOne(() => TicketType, ticketType => ticketType.tickets, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'type_id' })
  @IsOptional()
  @ValidateNested()
  public type?: TicketType | null
}

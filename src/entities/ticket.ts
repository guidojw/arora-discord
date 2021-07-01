import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import Channel from './channel'
import Guild from './guild'
import Member from './member'
import TicketType from './ticket-type'

@Entity('tickets')
export default class Ticket {
  @Expose()
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Expose({ name: 'author_id' })
  @Column('bigint', { name: 'author_id' })
  public authorId!: string

  @Expose({ name: 'channel_id' })
  @Column('bigint', { name: 'channel_id', nullable: true })
  public channelId?: string | null

  @Expose({ name: 'type_id' })
  @Column('int', { name: 'type_id', nullable: true })
  public typeId?: number | null

  @Expose({ name: 'guild_id' })
  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Expose()
  @Type(() => Guild)
  @ManyToOne(() => Guild, guild => guild.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  @Expose()
  @Type(() => Member)
  @ManyToMany(() => Member, member => member.moderatingTickets)
  public moderators?: Member[]

  @Expose()
  @Type(() => Member)
  @ManyToOne(() => Member, member => member.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  public author?: Member

  @Expose()
  @Type(() => Channel)
  @OneToOne(() => Channel, channel => channel.ticket, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'channel_id' })
  public channel?: Channel | null

  @Expose()
  @Type(() => TicketType)
  @ManyToOne(() => TicketType, ticketType => ticketType.tickets, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'type_id' })
  public type?: TicketType | null
}

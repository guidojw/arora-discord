import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import Channel from './channel'
import Guild from './guild'
import Member from './member'
import TicketType from './ticket-type'

@Entity('tickets')
export default class Ticket {
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Column('int', { name: 'author_id' })
  public authorId?: number | null

  @Column('bigint', { name: 'channel_id', nullable: true })
  public channelId!: string

  @Column('int', { name: 'type_id', nullable: true })
  public typeId?: number | null

  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @ManyToOne(() => Guild, guild => guild.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  @ManyToMany(() => Member, member => member.moderatingTickets)
  public moderators?: Member[]

  @ManyToOne(() => Member, member => member.tickets, { onDelete: 'CASCADE' }) // TODO: change to SET NULL
  @JoinColumn({ name: 'author_id' })
  public author?: Member | null

  @OneToOne(() => Channel, channel => channel.ticket, { onDelete: 'SET NULL' }) // TODO: change to CASCADE
  @JoinColumn({ name: 'channel_id' })
  public channel?: Channel

  @ManyToOne(() => TicketType, ticketType => ticketType.tickets, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'type_id' })
  public type?: TicketType | null
}

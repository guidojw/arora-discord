import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import Guild from './guild'
import { IsNotEmpty } from 'class-validator'
import Message from './message'
import Ticket from './ticket'

@Entity('ticket_types')
export default class TicketType {
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Column({ length: 16 })
  @IsNotEmpty()
  public name!: string

  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Column('bigint', { name: 'message_id' })
  public messageId?: string | null

  @ManyToOne(() => Guild, guild => guild.ticketTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  @OneToOne(() => Message, message => message.ticketType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  public message?: Message | null

  @OneToMany(() => Ticket, ticket => ticket.type)
  public tickets?: Ticket[]
}

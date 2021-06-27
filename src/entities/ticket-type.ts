import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
// import Emoji from './emoji'
import Guild from './guild'
import { IsNotEmpty } from 'class-validator'
import Message from './message'
import { Nand } from '../util/util'
import Ticket from './ticket'

@Entity({ name: 'ticket-types' })
export default class TicketType {
  @Expose()
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Expose()
  @Column({ length: 16 })
  @IsNotEmpty()
  public name!: string

  @Expose()
  @Column('varchar', { length: 7, nullable: true })
  @Nand('emojiId')
  public emoji?: string | null

  @Expose({ name: 'guild_id' })
  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Expose({ name: 'emoji_id' })
  @Column('bigint', { name: 'emoji_id', nullable: true })
  @Nand('emoji')
  public emojiId?: string | null

  @Expose({ name: 'message_id' })
  @Column('bigint', { name: 'message_id' })
  public messageId?: string | null

  @Expose()
  @Type(() => Guild)
  @ManyToOne(() => Guild, guild => guild.ticketTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild!: Guild

  // @Expose()
  // @Type(() => Emoji)
  // @ManyToOne(() => Emoji, emoji => emoji.ticketTypes, { onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'emoji_id' })
  // public emoji?: Emoji | null

  @Expose()
  @Type(() => Message)
  @OneToOne(() => Message, message => message.ticketType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  public message?: Message | null

  @Expose()
  @Type(() => Ticket)
  @OneToMany(() => Ticket, ticket => ticket.type)
  public tickets!: Ticket[]
}

import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { IsNotEmpty, ValidateIf } from 'class-validator'
// import Emoji from './emoji'
import Guild from './guild'
import Message from './message'
import Ticket from './ticket'
import { decorators } from '../utils'

const { Nand } = decorators

@Entity('ticket_types')
export default class TicketType {
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Column({ length: 16 })
  @IsNotEmpty()
  public name!: string

  @Column('varchar', { length: 7, nullable: true })
  @ValidateIf(ticketType => ticketType.emoji != null)
  @Nand('emojiId')
  @IsNotEmpty()
  public emoji?: string | null

  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Column('bigint', { name: 'emoji_id', nullable: true })
  @Nand('emoji')
  public emojiId?: string | null

  @Column('bigint', { name: 'message_id' })
  public messageId?: string | null

  @ManyToOne(() => Guild, guild => guild.ticketTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  /* eslint-disable max-len */
  // @ManyToOne(() => Emoji, emoji => emoji.ticketTypes, { onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'emoji_id' })
  // public emoji?: Emoji | null
  /* eslint-enable max-len */

  @OneToOne(() => Message, message => message.ticketType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  public message?: Message | null

  @OneToMany(() => Ticket, ticket => ticket.type)
  public tickets?: Ticket[]
}

import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import Guild from './guild'
import RoleMessage from './role-message'
import TicketType from './ticket-type'

@Entity({ name: 'emojis' })
export default class Emoji {
  @Expose()
  @PrimaryColumn({ type: 'bigint' })
  public id!: string

  @Expose({ name: 'guild_id' })
  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Expose()
  @Type(() => Guild)
  @ManyToOne(() => Guild, guild => guild.emojis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild!: Guild

  @Expose({ name: 'ticket_types' })
  @Type(() => TicketType)
  @OneToMany(() => TicketType, ticketType => ticketType.emoji)
  public ticketTypes!: TicketType[]

  @Expose({ name: 'role_messages' })
  @Type(() => RoleMessage)
  @OneToMany(() => RoleMessage, roleMessage => roleMessage.emoji)
  public roleMessages!: RoleMessage[]
}

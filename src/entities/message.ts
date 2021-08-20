import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from 'typeorm'
import Channel from './channel'
import Guild from './guild'
import Panel from './panel'
import RoleMessage from './role-message'
import TicketType from './ticket-type'

@Entity('messages')
export default class Message {
  @PrimaryColumn({ type: 'bigint' })
  public id!: string

  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Column('bigint', { name: 'channel_id' })
  public channelId!: string

  @ManyToOne(() => Guild, guild => guild.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  @ManyToOne(() => Channel, channel => channel.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  public channel?: Channel

  @OneToOne(() => Panel, panel => panel.message)
  public panel?: Panel | null

  @OneToOne(() => TicketType, ticketType => ticketType.message)
  public ticketType?: TicketType | null

  @OneToMany(() => RoleMessage, roleMessage => roleMessage.message)
  public roleMessages?: RoleMessage[]
}

import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import Channel from './channel'
import Guild from './guild'
import Panel from './panel'
import RoleMessage from './role-message'
import TicketType from './ticket-type'

@Entity({ name: 'messages' })
export default class Message {
  @Expose()
  @PrimaryColumn({ type: 'bigint' })
  public id!: string

  @Expose({ name: 'guild_id' })
  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Expose({ name: 'channel_id' })
  @Column('bigint', { name: 'channel_id' })
  public channelId!: string

  @Expose()
  @Type(() => Guild)
  @ManyToOne(() => Guild, guild => guild.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild!: Guild

  @Expose()
  @Type(() => Channel)
  @ManyToOne(() => Channel, channel => channel.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  public channel!: Channel

  @Expose()
  @Type(() => Panel)
  @OneToOne(() => Panel, panel => panel.message)
  public panel!: Panel

  @Expose({ name: 'ticket_type' })
  @Type(() => TicketType)
  @OneToOne(() => TicketType, ticketType => ticketType.message)
  public ticketType!: TicketType

  @Expose({ name: 'role_messages' })
  @Type(() => RoleMessage)
  @OneToMany(() => RoleMessage, roleMessage => roleMessage.message)
  public roleMessages!: RoleMessage[]
}

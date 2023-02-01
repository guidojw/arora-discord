import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from 'typeorm'
import { IsNumberString, IsOptional, ValidateIf, ValidateNested } from 'class-validator'
import Channel from './channel'
import Guild from './guild'
import Panel from './panel'
import RoleMessage from './role-message'
import TicketType from './ticket-type'

@Entity('messages')
export default class Message {
  @PrimaryColumn({ type: 'bigint' })
  @IsNumberString({ no_symbols: true })
  public id!: string

  @Column('bigint', { name: 'guild_id' })
  @IsNumberString({ no_symbols: true })
  public guildId!: string

  @Column('bigint', { name: 'channel_id' })
  @IsNumberString({ no_symbols: true })
  public channelId!: string

  @ManyToOne(() => Guild, guild => guild.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  @ValidateIf(message => typeof message.guild !== 'undefined')
  @ValidateNested()
  public guild?: Guild

  @ManyToOne(() => Channel, channel => channel.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  @ValidateIf(message => typeof message.channel !== 'undefined')
  @ValidateNested()
  public channel?: Channel

  @OneToOne(() => Panel, panel => panel.message)
  @IsOptional()
  @ValidateNested()
  public panel?: Panel | null

  @OneToOne(() => TicketType, ticketType => ticketType.message)
  @IsOptional()
  @ValidateNested()
  public ticketType?: TicketType | null

  @OneToMany(() => RoleMessage, roleMessage => roleMessage.message)
  @ValidateIf(message => typeof message.roleMessages !== 'undefined')
  @ValidateNested()
  public roleMessages?: RoleMessage[]
}

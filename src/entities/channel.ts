import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn
} from 'typeorm'
import { IsNumberString, IsOptional, ValidateIf, ValidateNested } from 'class-validator'
import Group from './group'
import Guild from './guild'
import Message from './message'
import Ticket from './ticket'

@Entity('channels')
export default class Channel {
  @PrimaryColumn({ type: 'bigint' })
  @IsNumberString({ no_symbols: true })
  public id!: string

  @Column('bigint', { name: 'guild_id' })
  @IsNumberString({ no_symbols: true })
  public guildId!: string

  @ManyToOne(() => Guild, guild => guild.channels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  @ValidateIf(channel => typeof channel.guild !== 'undefined')
  @ValidateNested()
  public guild?: Guild

  @ManyToMany(() => Group, group => group.channels)
  @ValidateIf(channel => typeof channel.groups !== 'undefined')
  @ValidateNested()
  public groups?: Group[]

  @ManyToMany(() => Channel, channel => channel.fromLinks, { cascade: true })
  @JoinTable({
    name: 'channels_channels',
    joinColumn: { name: 'from_channel_id' },
    inverseJoinColumn: { name: 'to_channel_id' }
  })
  @ValidateIf(channel => typeof channel.toLinks !== 'undefined')
  @ValidateNested()
  public toLinks?: Channel[]

  @ManyToMany(() => Channel, channel => channel.toLinks)
  @ValidateIf(channel => typeof channel.fromLinks !== 'undefined')
  @ValidateNested()
  public fromLinks?: Channel[]

  @OneToMany(() => Message, message => message.channel)
  @ValidateIf(channel => typeof channel.messages !== 'undefined')
  @ValidateNested()
  public messages?: Message[]

  @OneToOne(() => Ticket, ticket => ticket.channel)
  @IsOptional()
  @ValidateNested()
  public ticket?: Ticket | null
}

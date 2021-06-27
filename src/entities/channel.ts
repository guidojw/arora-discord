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
import { Expose, Type } from 'class-transformer'
import Group from './group'
import Guild from './guild'
import Message from './message'
import Ticket from './ticket'

@Entity({ name: 'channels' })
export default class Channel {
  @Expose()
  @PrimaryColumn({ type: 'bigint' })
  public id!: string

  @Expose({ name: 'guild_id' })
  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Expose()
  @Type(() => Guild)
  @ManyToOne(() => Guild, guild => guild.channels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild!: Guild

  @Expose()
  @Type(() => Group)
  @ManyToMany(() => Group, group => group.channels)
  @JoinTable({
    name: 'channels_groups',
    joinColumn: { name: 'channel_id' },
    inverseJoinColumn: { name: 'group_id' }
  })
  public groups!: Group[]

  @Expose({ name: 'from_links' })
  @Type(() => Channel)
  @ManyToMany(() => Channel, channel => channel.toLinks)
  @JoinTable({
    name: 'channels_channels',
    joinColumn: { name: 'from_channel_id' },
    inverseJoinColumn: { name: 'to_channel_id' }
  })
  public fromLinks!: Channel[]

  @Expose({ name: 'to_links' })
  @Type(() => Channel)
  @ManyToMany(() => Channel, channel => channel.fromLinks)
  public toLinks!: Channel[]

  @Expose()
  @Type(() => Message)
  @OneToMany(() => Message, message => message.channel)
  public messages!: Message[]

  @Expose()
  @Type(() => Ticket)
  @OneToOne(() => Ticket, ticket => ticket.channel)
  public ticket!: Ticket
}

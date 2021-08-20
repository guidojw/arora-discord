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
import Group from './group'
import Guild from './guild'
import Message from './message'
import Ticket from './ticket'

@Entity('channels')
export default class Channel {
  @PrimaryColumn({ type: 'bigint' })
  public id!: string

  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @ManyToOne(() => Guild, guild => guild.channels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  @ManyToMany(() => Group, group => group.channels)
  public groups?: Group[]

  @ManyToMany(() => Channel, channel => channel.toLinks)
  @JoinTable({
    name: 'channels_channels',
    joinColumn: { name: 'from_channel_id' },
    inverseJoinColumn: { name: 'to_channel_id' }
  })
  public fromLinks?: Channel[]

  @ManyToMany(() => Channel, channel => channel.fromLinks)
  public toLinks?: Channel[]

  @OneToMany(() => Message, message => message.channel)
  public messages?: Message[]

  @OneToOne(() => Ticket, ticket => ticket.channel)
  public ticket?: Ticket | null
}

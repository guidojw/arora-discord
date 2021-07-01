import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Expose, Type } from 'class-transformer'
import Guild from './guild'
import Role from './role'
import Ticket from './ticket'

@Entity('members')
export default class Member {
  @Expose()
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Expose({ name: 'user_id' })
  @Column('bigint', { name: 'user_id' })
  public userId!: string

  @Expose({ name: 'guild_id' })
  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Expose()
  @Type(() => Guild)
  @ManyToOne(() => Guild, guild => guild.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  @Expose()
  @Type(() => Ticket)
  @OneToMany(() => Ticket, ticket => ticket.author)
  public tickets?: Ticket[]

  @Expose({ name: 'moderating_tickets' })
  @Type(() => Ticket)
  @ManyToMany(() => Ticket, ticket => ticket.moderators)
  @JoinTable({
    name: 'tickets_moderators',
    joinColumn: { name: 'member_id' },
    inverseJoinColumn: { name: 'ticket_id' }
  })
  public moderatingTickets?: Ticket[]

  @Expose()
  @Type(() => Role)
  @ManyToMany(() => Role, role => role.members)
  @JoinTable({
    name: 'members_roles',
    joinColumn: { name: 'member_id' },
    inverseJoinColumn: { name: 'role_id' }
  })
  public roles?: Role[]
}

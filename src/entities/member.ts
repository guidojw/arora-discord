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
import Guild from './guild'
import Role from './role'
import Ticket from './ticket'

@Entity('members')
export default class Member {
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Column('bigint', { name: 'user_id' })
  public userId!: string

  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @ManyToOne(() => Guild, guild => guild.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  @OneToMany(() => Ticket, ticket => ticket.author, { cascade: true })
  public tickets?: Ticket[]

  @ManyToMany(() => Ticket, ticket => ticket.moderators)
  @JoinTable({
    name: 'tickets_moderators',
    joinColumn: { name: 'member_id' },
    inverseJoinColumn: { name: 'ticket_id' }
  })
  public moderatingTickets?: Ticket[]

  @ManyToMany(() => Role, role => role.members)
  @JoinTable({
    name: 'members_roles',
    joinColumn: { name: 'member_id' },
    inverseJoinColumn: { name: 'role_id' }
  })
  public roles?: Role[]
}

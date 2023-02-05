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
import { IsArray, IsNumber, IsNumberString, ValidateIf, ValidateNested } from 'class-validator'
import Guild from './guild'
import Role from './role'
import Ticket from './ticket'

@Entity('members')
export default class Member {
  @PrimaryGeneratedColumn()
  @ValidateIf(member => typeof member.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Column('bigint', { name: 'user_id' })
  @IsNumberString({ no_symbols: true })
  public userId!: string

  @Column('bigint', { name: 'guild_id' })
  @IsNumberString({ no_symbols: true })
  public guildId!: string

  @ManyToOne(() => Guild, guild => guild.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  @ValidateIf(member => typeof member.guild !== 'undefined')
  @ValidateNested()
  public guild?: Guild

  @OneToMany(() => Ticket, ticket => ticket.author)
  @ValidateIf(member => typeof member.tickets !== 'undefined')
  @ValidateNested()
  @IsArray()
  public tickets?: Ticket[]

  @ManyToMany(() => Ticket, ticket => ticket.moderators, { cascade: true })
  @JoinTable({
    name: 'tickets_moderators',
    joinColumn: { name: 'member_id' },
    inverseJoinColumn: { name: 'ticket_id' }
  })
  @ValidateIf(member => typeof member.moderatingTickets !== 'undefined')
  @ValidateNested()
  @IsArray()
  public moderatingTickets?: Ticket[]

  @ManyToMany(() => Role, role => role.members, { cascade: true })
  @JoinTable({
    name: 'members_roles',
    joinColumn: { name: 'member_id' },
    inverseJoinColumn: { name: 'role_id' }
  })
  @ValidateIf(member => typeof member.roles !== 'undefined')
  @ValidateNested()
  @IsArray()
  public roles?: Role[]
}

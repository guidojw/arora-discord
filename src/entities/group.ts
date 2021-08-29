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
import Channel from './channel'
import { GroupType } from '../util/constants'
import Guild from './guild'
import { IsNotEmpty } from 'class-validator'
import Permission from './permission'
import Role from './role'

@Entity('groups')
export default class Group {
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Column({ length: 255 })
  @IsNotEmpty()
  public name!: string

  @Column({ type: 'enum', enum: GroupType })
  public type!: GroupType

  @Column({ default: false })
  public guarded!: boolean

  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @ManyToOne(() => Guild, guild => guild.groups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  @ManyToMany(() => Channel, channel => channel.groups, { cascade: true })
  @JoinTable({
    name: 'channels_groups',
    joinColumn: { name: 'group_id' },
    inverseJoinColumn: { name: 'channel_id' }
  })
  public channels?: Channel[]

  @ManyToMany(() => Role, role => role.groups, { cascade: true })
  @JoinTable({
    name: 'roles_groups',
    joinColumn: { name: 'group_id' },
    inverseJoinColumn: { name: 'role_id' }
  })
  public roles?: Role[]

  @OneToMany(() => Permission, permission => permission.group)
  public permissions?: Permission[]
}

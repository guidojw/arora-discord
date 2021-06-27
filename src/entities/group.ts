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
import Channel from './channel'
import { GroupType } from '../util/constants'
import Guild from './guild'
import { IsNotEmpty } from 'class-validator'
import Permission from './permission'
import Role from './role'

@Entity({ name: 'groups' })
export default class Group {
  @Expose()
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Expose()
  @Column({ length: 255 })
  @IsNotEmpty()
  public name!: string

  @Expose()
  @Column({ type: 'enum', enum: GroupType })
  public type!: GroupType

  @Expose()
  @Column({ default: false })
  public guarded!: boolean

  @Expose({ name: 'guild_id' })
  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Expose()
  @Type(() => Guild)
  @ManyToOne(() => Guild, guild => guild.groups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild!: Guild

  @Expose()
  @Type(() => Channel)
  @ManyToMany(() => Channel, channel => channel.groups)
  public channels!: Channel[]

  @Expose()
  @Type(() => Role)
  @ManyToMany(() => Role, role => role.groups)
  @JoinTable({
    name: 'roles_groups',
    joinColumn: { name: 'group_id' },
    inverseJoinColumn: { name: 'role_id' }
  })
  public roles!: Role[]

  @Expose()
  @Type(() => Permission)
  @OneToMany(() => Permission, permission => permission.group)
  public permissions!: Permission[]
}

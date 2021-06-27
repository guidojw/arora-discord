import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import Command from './command'
import Group from './group'
import Role from './role'
import { Xor } from '../util/util'

@Entity({ name: 'permissions' })
export default class Permission {
  @Expose()
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Expose()
  @Column()
  public allow!: boolean

  @Expose({ name: 'role_id' })
  @Column('bigint', { name: 'role_id', nullable: true })
  @Xor('groupId')
  public roleId?: string | null

  @Expose({ name: 'group_id' })
  @Column('int', { name: 'group_id', nullable: true })
  @Xor('roleId')
  public groupId?: number | null

  @Expose({ name: 'command_id' })
  @Column({ name: 'command_id' })
  public commandId!: number

  @Expose()
  @Type(() => Role)
  @ManyToOne(() => Role, role => role.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  public role?: Role | null

  @Expose()
  @Type(() => Group)
  @ManyToOne(() => Group, group => group.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  public group?: Group | null

  @Expose()
  @Type(() => Command)
  @ManyToOne(() => Command, command => command.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'command_id' })
  public command!: Command
}

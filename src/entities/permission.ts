import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Command from './command'
import Group from './group'
import Role from './role'
import { decorators } from '../util'

const { Xor } = decorators

@Entity('permissions')
export default class Permission {
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Column()
  public allow!: boolean

  @Column('bigint', { name: 'role_id', nullable: true })
  @Xor('groupId')
  public roleId?: string | null

  @Column('int', { name: 'group_id', nullable: true })
  @Xor('roleId')
  public groupId?: number | null

  @Column({ name: 'command_id' })
  public commandId!: number

  @ManyToOne(() => Role, role => role.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  public role?: Role | null

  @ManyToOne(() => Group, group => group.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  public group?: Group | null

  @ManyToOne(() => Command, command => command.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'command_id' })
  public command?: Command
}

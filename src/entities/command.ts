import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { CommandType } from '../utils/constants'
import GuildCommand from './guild-command'
import { IsNotEmpty } from 'class-validator'
import Permission from './permission'

@Entity('commands')
export default class Command {
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Column({ length: 255 })
  @IsNotEmpty()
  public name!: string

  @Column({ type: 'enum', enum: CommandType })
  public type!: CommandType

  @OneToMany(() => GuildCommand, guildCommand => guildCommand.command)
  public guildCommands?: GuildCommand[]

  @OneToMany(() => Permission, permission => permission.command)
  public permissions?: Permission[]
}

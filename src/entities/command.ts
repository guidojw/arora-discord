import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import { CommandType } from '../util/constants'
import GuildCommand from './guild-command'
import { IsNotEmpty } from 'class-validator'
import Permission from './permission'

@Entity('commands')
export default class Command {
  @Expose()
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Expose()
  @Column({ length: 255 })
  @IsNotEmpty()
  public name!: string

  @Expose()
  @Column({ type: 'enum', enum: CommandType })
  public type!: CommandType

  @Expose({ name: 'guild_commands' })
  @Type(() => GuildCommand)
  @OneToMany(() => GuildCommand, guildCommand => guildCommand.command)
  public guildCommands?: GuildCommand[]

  @Expose()
  @Type(() => Permission)
  @OneToMany(() => Permission, permission => permission.command)
  public permissions?: Permission[]
}

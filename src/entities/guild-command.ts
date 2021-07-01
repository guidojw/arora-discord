import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import Command from './command'
import Guild from './guild'

@Entity('guilds_commands')
export default class GuildCommand {
  @Expose({ name: 'guild_id' })
  @PrimaryColumn({ type: 'bigint', name: 'guild_id' })
  public guildId!: string

  @Expose({ name: 'command_id' })
  @PrimaryColumn({ name: 'command_id' })
  public commandId!: number

  @Expose()
  @Column()
  public enabled!: boolean

  @Expose()
  @Type(() => Guild)
  @ManyToOne(() => Guild, guild => guild.guildCommands, { onDelete: 'CASCADE' })
  public guild?: Guild

  @Expose()
  @Type(() => Command)
  @ManyToOne(() => Command, command => command.guildCommands, { onDelete: 'CASCADE' })
  public command?: Command
}

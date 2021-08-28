import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import Command from './command'
import Guild from './guild'

@Entity('guilds_commands')
export default class GuildCommand {
  @PrimaryColumn({ type: 'bigint', name: 'guild_id' })
  public guildId!: string

  @PrimaryColumn({ name: 'command_id' })
  public commandId!: number

  @Column()
  public enabled!: boolean

  @ManyToOne(() => Guild, guild => guild.guildCommands, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  @ManyToOne(() => Command, command => command.guildCommands, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'command_id' })
  public command?: Command
}

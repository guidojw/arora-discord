import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import { IsArray, IsNumberString, ValidateIf, ValidateNested } from 'class-validator'
import Guild from './guild'
import RoleMessage from './role-message'

@Entity('emojis')
export default class Emoji {
  @PrimaryColumn({ type: 'bigint' })
  @IsNumberString({ no_symbols: true })
  public id!: string

  @Column('bigint', { name: 'guild_id' })
  @IsNumberString({ no_symbols: true })
  public guildId!: string

  @ManyToOne(() => Guild, guild => guild.emojis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  @ValidateIf(emoji => typeof emoji.guild !== 'undefined')
  @ValidateNested()
  public guild?: Guild

  @OneToMany(() => RoleMessage, roleMessage => roleMessage.emoji)
  @ValidateIf(emoji => typeof emoji.roleMessages !== 'undefined')
  @ValidateNested()
  @IsArray()
  public roleMessages?: RoleMessage[]
}

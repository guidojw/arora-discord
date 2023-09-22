import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import { IsArray, IsNumberString, ValidateIf, ValidateNested } from 'class-validator'
import Guild from './guild'
import RoleRoleList from './role-role-list'

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

  @OneToMany(() => RoleRoleList, roleRoleList => roleRoleList.emoji)
  @ValidateIf(emoji => typeof emoji.roleRoleLists !== 'undefined')
  @ValidateNested()
  @IsArray()
  public roleRoleLists?: RoleRoleList[]
}

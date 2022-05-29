import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import Guild from './guild'
import RoleMessage from './role-message'

@Entity('emojis')
export default class Emoji {
  @PrimaryColumn({ type: 'bigint' })
  public id!: string

  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @ManyToOne(() => Guild, guild => guild.emojis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  @OneToMany(() => RoleMessage, roleMessage => roleMessage.emoji)
  public roleMessages?: RoleMessage[]
}

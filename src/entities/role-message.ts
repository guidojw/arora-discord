import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, ValidateIf } from 'class-validator'
// import Emoji from './emoji'
import Guild from './guild'
import Message from './message'
import Role from './role'
import { Xor } from '../util/util'

@Entity({ name: 'role_messages' })
export default class RoleMessage {
  @Expose()
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Expose()
  @Column('string', { length: 7, nullable: true })
  @ValidateIf(roleMessage => roleMessage.emoji != null)
  @Xor('emojiId')
  @IsNotEmpty()
  public emoji?: string | null

  @Expose({ name: 'guild_id' })
  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Expose()
  @Column('bigint', { name: 'emoji_id', nullable: true })
  @Xor('emoji')
  public emojiId?: string | null

  @Expose({ name: 'role_id' })
  @Column('bigint', { name: 'role_id' })
  public roleId!: string

  @Expose({ name: 'message_id' })
  @Column('bigint', { name: 'message_id', nullable: true })
  public messageId?: string | null

  @Expose()
  @Type(() => Guild)
  @ManyToOne(() => Guild, guild => guild.roleMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild!: Guild

  // @Expose()
  // @Type(() => Emoji)
  // @ManyToOne(() => Emoji, emoji => emoji.roleMessages, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'emoji_id' })
  // public emoji?: Emoji | null

  @Expose()
  @Type(() => Role)
  @ManyToOne(() => Role, role => role.roleMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  public role!: Role

  @Expose()
  @Type(() => Message)
  @ManyToOne(() => Message, message => message.roleMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  public message?: Message | null
}

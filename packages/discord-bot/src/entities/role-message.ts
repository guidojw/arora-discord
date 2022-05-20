import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { IsNotEmpty, ValidateIf } from 'class-validator'
// import Emoji from './emoji'
import Guild from './guild'
import Message from './message'
import Role from './role'
import { decorators } from '../utils'

const { Xor } = decorators

@Entity('role_messages')
export default class RoleMessage {
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Column('varchar', { length: 7, nullable: true })
  @ValidateIf(roleMessage => roleMessage.emoji != null)
  @Xor('emojiId')
  @IsNotEmpty()
  public emoji?: string | null

  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Column('bigint', { name: 'emoji_id', nullable: true })
  @Xor('emoji')
  public emojiId?: string | null

  @Column('bigint', { name: 'role_id' })
  public roleId!: string

  @Column('bigint', { name: 'message_id' })
  public messageId!: string

  @ManyToOne(() => Guild, guild => guild.roleMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  /* eslint-disable max-len */
  // @ManyToOne(() => Emoji, emoji => emoji.roleMessages, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'emoji_id' })
  // public emoji?: Emoji | null
  /* eslint-enable max-len */

  @ManyToOne(() => Role, role => role.roleMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  public role?: Role

  @ManyToOne(() => Message, message => message.roleMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  public message?: Message | null
}

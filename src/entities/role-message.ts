import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator'
// import Emoji from './emoji'
import Guild from './guild'
import Message from './message'
import Role from './role'
import { decorators } from '../utils'

const { Xor } = decorators

@Entity('role_messages')
export default class RoleMessage {
  @PrimaryGeneratedColumn()
  @ValidateIf(roleMessage => typeof roleMessage.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Column('varchar', { length: 7, nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Xor('emojiId')
  public emoji?: string | null

  @Column('bigint', { name: 'guild_id' })
  @IsNumberString({ no_symbols: true })
  public guildId!: string

  @Column('bigint', { name: 'emoji_id', nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Xor('emoji')
  public emojiId?: string | null

  @Column('bigint', { name: 'role_id' })
  @IsNumberString({ no_symbols: true })
  public roleId!: string

  @Column('bigint', { name: 'message_id' })
  @IsNumberString({ no_symbols: true })
  public messageId!: string

  @ManyToOne(() => Guild, guild => guild.roleMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  @ValidateIf(roleMessage => typeof roleMessage.guild !== 'undefined')
  @ValidateNested()
  public guild?: Guild

  /* eslint-disable max-len */
  // @ManyToOne(() => Emoji, emoji => emoji.roleMessages, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'emoji_id' })
  // @IsOptional()
  // @ValidateNested()
  // public emoji?: Emoji | null
  /* eslint-enable max-len */

  @ManyToOne(() => Role, role => role.roleMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  @ValidateIf(roleMessage => typeof roleMessage.role !== 'undefined')
  @ValidateNested()
  public role?: Role

  @ManyToOne(() => Message, message => message.roleMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  @IsOptional()
  @ValidateNested()
  public message?: Message | null
}

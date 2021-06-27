import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import Guild from './guild'
import Message from './message'

@Entity({ name: 'panels' })
export default class Panel {
  @Expose()
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Expose()
  @Column({ length: 255 })
  public name!: string

  @Expose()
  @Column({ length: 7000 })
  public content!: string

  @Expose({ name: 'guild_id' })
  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Expose({ name: 'message_id' })
  @Column('bigint', { name: 'message_id', nullable: true, unique: true })
  public messageId?: string | null

  @Expose()
  @Type(() => Guild)
  @ManyToOne(() => Guild, guild => guild.panels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild!: Guild

  @Expose()
  @Type(() => Message)
  @ManyToOne(() => Message, message => message.panel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'message_id' })
  public message?: Message | null
}

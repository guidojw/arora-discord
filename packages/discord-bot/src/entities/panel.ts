import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Guild from './guild'
import Message from './message'

@Entity('panels')
export default class Panel {
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Column({ length: 255 })
  public name!: string

  @Column({ length: 7000 })
  public content!: string

  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Column('bigint', { name: 'message_id', nullable: true, unique: true })
  public messageId?: string | null

  @ManyToOne(() => Guild, guild => guild.panels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  @ManyToOne(() => Message, message => message.panel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'message_id' })
  public message?: Message | null
}

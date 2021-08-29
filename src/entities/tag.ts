import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import Guild from './guild'
import { IsNotEmpty } from 'class-validator'
import TagName from './tag-name'

@Entity('tags')
export default class Tag {
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Column({ length: 7000 })
  @IsNotEmpty()
  public content!: string

  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @ManyToOne(() => Guild, guild => guild.roleMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild?: Guild

  @OneToMany(() => TagName, tagName => tagName.tag, { cascade: true })
  public names?: TagName[]
}

import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import Guild from './guild'
import { IsNotEmpty } from 'class-validator'
import TagName from './tag-name'

@Entity({ name: 'tags' })
export default class Tag {
  @Expose()
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Expose()
  @Column({ length: 7000 })
  @IsNotEmpty()
  public content!: string

  @Expose({ name: 'guild_id' })
  @Column('bigint', { name: 'guild_id' })
  public guildId!: string

  @Expose()
  @Type(() => Guild)
  @ManyToOne(() => Guild, guild => guild.roleMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  public guild!: Guild

  @Expose()
  @Type(() => TagName)
  @OneToMany(() => TagName, tagName => tagName.tag)
  public names!: TagName[]
}

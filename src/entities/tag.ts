import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { IsNotEmpty, IsNumber, IsNumberString, IsString, MaxLength, ValidateIf, ValidateNested } from 'class-validator'
import Guild from './guild'
import TagName from './tag-name'

@Entity('tags')
export default class Tag {
  @PrimaryGeneratedColumn()
  @ValidateIf(tag => typeof tag.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Column({ length: 7000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(70000)
  public content!: string

  @Column('bigint', { name: 'guild_id' })
  @IsNumberString({ no_symbols: true })
  public guildId!: string

  @ManyToOne(() => Guild, guild => guild.roleMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  @ValidateIf(tag => typeof tag.guild !== 'undefined')
  @ValidateNested()
  public guild?: Guild

  @OneToMany(() => TagName, tagName => tagName.tag, { cascade: true })
  @ValidateIf(tag => typeof tag.names !== 'undefined')
  @ValidateNested()
  public names?: TagName[]
}

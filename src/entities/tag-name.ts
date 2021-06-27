import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import { IsLowercase, IsNotEmpty } from 'class-validator'
import Tag from './tag'

@Entity({ name: 'tag_names' })
export default class TagName {
  @Expose()
  @PrimaryColumn({ length: 255 })
  @IsNotEmpty()
  @IsLowercase()
  public name!: string

  @Expose({ name: 'tag_id' })
  @Column({ name: 'tag_id' })
  public tagId!: number

  @Expose()
  @Type(() => Tag)
  @ManyToOne(() => Tag, tag => tag.names, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  public tag!: Tag
}

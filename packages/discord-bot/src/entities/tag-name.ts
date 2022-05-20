import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { IsLowercase, IsNotEmpty } from 'class-validator'
import Tag from './tag'

@Entity('tag_names')
export default class TagName {
  @PrimaryColumn({ length: 255 })
  @IsNotEmpty()
  @IsLowercase()
  public name!: string

  @Column({ name: 'tag_id' })
  public tagId!: number

  @ManyToOne(() => Tag, tag => tag.names, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  public tag?: Tag

  public get id (): string {
    return this.name
  }
}

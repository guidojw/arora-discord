import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { IsLowercase, IsNotEmpty, IsNumber, IsString, MaxLength, ValidateIf, ValidateNested } from 'class-validator'
import Tag from './tag'

@Entity('tag_names')
export default class TagName {
  @PrimaryColumn({ length: 255 })
  @IsString()
  @IsNotEmpty()
  @IsLowercase()
  @MaxLength(255)
  public name!: string

  @Column({ name: 'tag_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public tagId!: number

  @ManyToOne(() => Tag, tag => tag.names, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  @ValidateIf(tagName => typeof tagName.tag !== 'undefined')
  @ValidateNested()
  public tag?: Tag

  public get id (): string {
    return this.name
  }
}

import BaseStructure from './base'
import type Tag from './tag'
import type { TagName as TagNameEntity } from '../entities'
import { injectable } from 'inversify'

@injectable()
export default class TagName extends BaseStructure<TagNameEntity> {
  public tag!: Tag

  public name!: string

  public setOptions (data: TagNameEntity, tag: Tag): void {
    this.tag = tag

    this.setup(data)
  }

  public setup (data: TagNameEntity): void {
    this.name = data.name
  }

  public get id (): string {
    return this.name
  }

  public async delete (): Promise<void> {
    return await this.tag.names.delete(this)
  }
}

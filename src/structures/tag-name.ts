import BaseStructure from './base'
import Client from '../client/client'
import Tag from './tag'

export default class TagName extends BaseStructure {
  public readonly tag: Tag
  public name!: string

  public constructor (client: Client, data: any, tag: Tag) {
    super(client )
    this.tag = tag

    this.setup(data)
  }

  public setup (data: any): void {
    this.name = data.name
  }

  public delete (): void {
    return this.tag.names.delete(this)
  }
}

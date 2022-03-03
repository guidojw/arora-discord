import { BaseStructureArgumentType } from './base'
import { ChannelGroup } from '../structures'
import type { Group as GroupEntity } from '../entities'
import { injectable } from 'inversify'

@injectable()
export default class ChannelGroupArgumentType extends BaseStructureArgumentType<ChannelGroup, GroupEntity> {
  public constructor () {
    super(ChannelGroup, 'groups')
  }
}

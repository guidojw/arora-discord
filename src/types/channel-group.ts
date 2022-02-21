import { BaseStructureArgumentType } from './base'
import { ChannelGroup } from '../structures'
import { injectable } from 'inversify'

@injectable()
export default class ChannelGroupArgumentType extends BaseStructureArgumentType<ChannelGroup> {
  public constructor () {
    super(ChannelGroup, 'groups')
  }
}

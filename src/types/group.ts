import { BaseStructureArgumentType } from './base'
import { Group } from '../structures'
import type { Group as GroupEntity } from '../entities'
import { injectable } from 'inversify'

@injectable()
export default class GroupArgumentType extends BaseStructureArgumentType<Group, GroupEntity> {
  public constructor () {
    super(Group)
  }
}

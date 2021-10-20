import { BaseStructureArgumentType } from './base'
import { Group } from '../structures'
import { injectable } from 'inversify'

@injectable()
export default class GroupArgumentType extends BaseStructureArgumentType<Group> {
  public constructor () {
    super(Group, 'groups')
  }
}

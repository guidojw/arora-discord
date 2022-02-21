import { BaseStructureArgumentType } from './base'
import { RoleGroup } from '../structures'
import { injectable } from 'inversify'

@injectable()
export default class RoleGroupArgumentType extends BaseStructureArgumentType<RoleGroup> {
  public constructor () {
    super(RoleGroup, 'groups')
  }
}

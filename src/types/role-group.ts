import { BaseStructureArgumentType } from './base'
import type { Group as GroupEntity } from '../entities'
import { RoleGroup } from '../structures'
import { injectable } from 'inversify'

@injectable()
export default class RoleGroupArgumentType extends BaseStructureArgumentType<RoleGroup, GroupEntity> {
  public constructor () {
    super(RoleGroup, 'groups')
  }
}

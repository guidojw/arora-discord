import { BaseStructureArgumentType } from './base'
import { RoleMessage } from '../structures'
import type { RoleMessage as RoleMessageEntity } from '../entities'
import { injectable } from 'inversify'

@injectable()
export default class RoleMessageArgumentType extends BaseStructureArgumentType<RoleMessage, RoleMessageEntity> {
  public constructor () {
    super(RoleMessage)
  }
}

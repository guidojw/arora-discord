import { BaseStructureArgumentType } from './base'
import { RoleMessage } from '../structures'
import { injectable } from 'inversify'

@injectable()
export default class RoleMessageArgumentType extends BaseStructureArgumentType<RoleMessage> {
  public constructor () {
    super(RoleMessage)
  }
}

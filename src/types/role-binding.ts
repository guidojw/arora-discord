import { BaseStructureArgumentType } from './base'
import { RoleBinding } from '../structures'
import { injectable } from 'inversify'

@injectable()
export default class RoleBindingArgumentType extends BaseStructureArgumentType<RoleBinding> {
  public constructor () {
    super(RoleBinding)
  }
}

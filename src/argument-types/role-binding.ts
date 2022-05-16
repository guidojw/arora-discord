import { BaseStructureArgumentType } from './base'
import { RoleBinding } from '../structures'
import type { RoleBinding as RoleBindingEntity } from '../entities'
import { injectable } from 'inversify'

@injectable()
export default class RoleBindingArgumentType extends BaseStructureArgumentType<RoleBinding, RoleBindingEntity> {
  public constructor () {
    super(RoleBinding)
  }
}

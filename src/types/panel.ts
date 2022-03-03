import { BaseStructureArgumentType } from './base'
import { Panel } from '../structures'
import type { Panel as PanelEntity } from '../entities'
import { injectable } from 'inversify'

@injectable()
export default class PanelArgumentType extends BaseStructureArgumentType<Panel, PanelEntity> {
  public constructor () {
    super(Panel)
  }
}

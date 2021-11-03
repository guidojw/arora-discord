import { BaseStructureArgumentType } from './base'
import { Panel } from '../structures'
import { injectable } from 'inversify'

@injectable()
export default class PanelArgumentType extends BaseStructureArgumentType<Panel> {
  public constructor () {
    super(Panel, 'panels')
  }
}

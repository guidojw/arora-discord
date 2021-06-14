import BaseArgumentType from './base'
import { CommandoClient } from 'discord.js-commando'
import { Panel } from '../structures'

export default class PanelArgumentType extends BaseArgumentType<Panel> {
  public constructor (client: CommandoClient) {
    super(client, Panel)
  }
}
